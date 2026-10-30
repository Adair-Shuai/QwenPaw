function P() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ks() {
  try {
    return P().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ln(e) {
  return P().getApiUrl(e);
}
function Xs(e) {
  const t = Ks();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function Ys(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, i) => {
    n[i] = r;
  }), n;
}
function ct(e, t) {
  const n = P(), r = Ys(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...Xs(), ...r }
  });
}
const rn = /* @__PURE__ */ new Map(), Qs = 15e3;
function Zs(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function eo(e, t, n) {
  return `${e}:${t}:${n}`;
}
function Lt() {
  rn.clear();
}
function wr(e) {
  for (const [t, n] of rn)
    (e ? n.agentId === e : n.agentId) && rn.delete(t);
}
async function pe(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...i } = t || {}, a = Zs(
    i.headers
  ), s = eo(n, e, a);
  if (n !== "GET" && (a ? wr(a) : Lt()), n === "GET" && !r) {
    const d = rn.get(s);
    if (d && Date.now() - d.ts < Qs)
      return d.data;
  }
  const l = await ct(e, i);
  if (!l.ok) {
    const d = await l.text().catch(() => "");
    throw new Error(d || `HTTP ${l.status}`);
  }
  if (l.status === 204) return null;
  const o = await l.json();
  return n === "GET" && rn.set(s, {
    data: o,
    ts: Date.now(),
    agentId: a || void 0
  }), o;
}
const ui = `
.ugsci-expert-page>div:first-child{border-color:var(--app-border)!important;gap:12px;flex-wrap:wrap;}
.ugsci-expert-library button[class*="-btn-link"],.ugsci-expert-settings button[class*="-btn-link"]{color:var(--expert-primary)!important;}
@media(max-width:680px){.ugsci-expert-page{padding:16px!important;}}

.ugsci-expert-library,.ugsci-expert-settings{color:var(--app-text,var(--app-card-text));--expert-line:var(--app-border,var(--app-border-subtle));--expert-muted:var(--app-text-secondary,var(--app-card-muted));--expert-surface:var(--app-surface,var(--app-surface));--expert-subtle:var(--app-surface-subtle,var(--app-fill-faint));--expert-primary:var(--app-action-link,var(--app-accent));}
.ugsci-expert-filters{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 18px;}
.ugsci-expert-filter{font:inherit;font-size:13px;padding:6px 11px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--expert-muted);cursor:pointer;}
.ugsci-expert-filter[aria-pressed=true]{color:var(--expert-primary);background:color-mix(in srgb,var(--expert-primary) 9%,var(--expert-surface));border-color:color-mix(in srgb,var(--expert-primary) 25%,var(--expert-line));}
.ugsci-expert-filter small{font-size:11px;margin-left:6px;}
.ugsci-expert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:14px;align-items:stretch;}
.ugsci-expert-card{width:100%;height:100%;border-radius:11px!important;border-color:var(--expert-line)!important;background:var(--expert-surface)!important;box-shadow:none!important;}
.ugsci-expert-card .ugsci-expert-card-top{display:flex;gap:10px;align-items:flex-start;min-width:0;}
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
.ugsci-expert-settings [class*="-modal-content"]{padding:0!important;overflow:hidden;border:1px solid var(--expert-line);border-radius:11px!important;background:var(--expert-surface)!important;}
.ugsci-expert-settings [class*="-modal-header"]{margin:0!important;padding:18px 24px;border-bottom:1px solid var(--expert-line);background:var(--expert-surface)!important;}
.ugsci-expert-settings [class*="-modal-body"]{padding:0!important;}
.ugsci-expert-settings-identity{display:flex;align-items:center;gap:12px;padding:18px 24px;border-bottom:1px solid var(--expert-line);}
.ugsci-expert-settings-identity strong{font-size:15px;font-weight:500;overflow-wrap:anywhere;}
.ugsci-expert-settings-identity small{display:block;color:var(--expert-muted);margin-top:4px;overflow-wrap:anywhere;}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"]{background:var(--expert-subtle);width:165px;flex-shrink:0;padding:14px 8px;}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] :is(.ant-tabs-tab,.qwenpaw-tabs-tab){margin:3px 0!important;padding:10px 12px!important;border-radius:6px;}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] [class*="-tabs-tab-active"]{background:color-mix(in srgb,var(--expert-primary) 9%,var(--expert-surface));}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-content-holder"]{min-width:0;}
.ugsci-expert-settings .ugsci-settings-tabs [class*="-tabs-tabpane"]{padding:24px!important;min-height:400px;}
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
`, mi = [
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
], to = mi, pi = [
  "全部专家",
  "油气工程",
  "数据与研究",
  "通用助手",
  "应用专家"
];
function gi(e) {
  return pe(
    `/ugsci/experts/${encodeURIComponent(e)}/presentation`,
    { headers: { "X-Agent-Id": e } }
  );
}
function no(e, t) {
  return pe(
    `/ugsci/experts/${encodeURIComponent(e)}/presentation`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(t)
    }
  );
}
function ro(e) {
  var a;
  const t = (s) => s.replace(/\*\*|`|^#+\s*/gm, "").replace(/^\s*[-*•]\s*/gm, "").replace(/\s+/g, " ").replace(/\s*[-•|]+\s*$/, "").trim(), n = ((a = e.split(/\s+\|\s+|\n/)[0]) == null ? void 0 : a.trim()) || "", r = /(?:定位|职责)[：:]\s*([\s\S]*?)(?=\s*(?:[-•]\s*)?(?:风格|Agent ID|上游|输出)[：:]|$)/i.exec(
    e
  );
  let i = t(n);
  return (!i || /^(?:名字|Agent ID)[：:]|^Default QwenPaw agent/i.test(i)) && (i = t((r == null ? void 0 : r[1]) || "")), /挑个你喜欢|机器里的幽灵|AI？机器人/.test(i) && (i = ""), i.length > 110 ? `${i.slice(0, 109).replace(/[，、；：\s]+$/, "")}…` : i;
}
function an(e) {
  var c, m;
  const { agent: t, presentation: n } = e, r = mi.find(
    (u) => u.id === t.id || u.name === t.name
  ), i = `${t.name} ${(r == null ? void 0 : r.category) || ""} ${t.description || ""}`, a = t.managed_by_app ? "应用专家" : /资料审核|数据诊断|数值模拟分析|数据分析|科研|研究方法/.test(i) ? "数据与研究" : /油气|储气|气藏|油藏|地质|钻井|钻完井|物性|PVT|库存|注采|采油|测井|储层/i.test(
    i
  ) ? "油气工程" : "通用助手", s = t.managed_by_app ? "应用专家" : (n == null ? void 0 : n.category) || a, l = (n == null ? void 0 : n.summary) || ro(((c = e.config) == null ? void 0 : c.description) || t.description || "") || (t.id === "default" ? "处理日常问答、信息整理和电脑操作任务。" : "尚未填写简介，可在设置中补充职责说明。"), o = e.skills.filter((u) => u.enabled !== !1), d = [
    ...new Set(
      (m = r == null ? void 0 : r.tags) != null && m.length ? r.tags : o.flatMap((u) => u.tags || [])
    )
  ].slice(0, 2);
  return {
    name: (n == null ? void 0 : n.display_name) || t.name,
    specialty: t.managed_by_app ? "应用专属专家" : (n == null ? void 0 : n.specialty) || (r == null ? void 0 : r.category) || s,
    category: s,
    summary: l,
    tags: d
  };
}
const nt = {
  background: "var(--app-action-bg, var(--app-accent, #0072f5))",
  color: "var(--app-action-fg, #fff)",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function xr(e, t) {
  const n = P();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function Bn({
  title: e,
  subtitle: t,
  extra: n
}) {
  const r = P().React, { Space: i } = P().antd;
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
    n ? r.createElement(i, null, n) : null
  );
}
async function pn() {
  const e = await pe("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Sr(e) {
  return pe(`/agents/${encodeURIComponent(e)}`);
}
async function jn(e) {
  return await pe(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Nn(e = !1) {
  return await pe(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function ao(e) {
  const t = await pe(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function io() {
  return (await pe("/skills/workspaces") || []).map((t) => ({
    agent_id: t.agent_id,
    agent_name: t.agent_name || "",
    // Current hosts return skill_names. Keep the legacy fallback so the
    // plugin remains compatible with older QwenPaw releases.
    skill_names: Array.isArray(t.skill_names) ? t.skill_names : Array.isArray(t.skills) ? t.skills.map((n) => n.name) : []
  }));
}
function Bt(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function fi(e) {
  var n;
  const t = [];
  for (const r of e) {
    if (r.enabled === !1) continue;
    const i = (n = r.description) == null ? void 0 : n.trim();
    if (!i) continue;
    const a = (r.name || i).length > 20 ? (r.name || i).substring(0, 18) + "…" : r.name || i;
    let s = i;
    if (s = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(s) ? s = `请${s}` : /^(a |an |the )/i.test(s) ? s = `Help me with ${s}` : /[。？！.?!]$/.test(s) || (s = `帮我${s}`), s.length > 80 && (s = s.substring(0, 77) + "..."), t.push({ label: a, value: s }), t.length >= 4) break;
  }
  return t;
}
async function so(e) {
  return await pe("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function At(e, t, n) {
  return pe(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function oo(e, t, n, r) {
  return pe("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const lo = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function co(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (lo.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function uo(e, t) {
  const n = await Sr(e);
  n.system_prompt_files = t, await pe(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function kr(e, t) {
  await pe("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function yi(e, t) {
  await pe(
    Bt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function _r(e, t) {
  await pe(
    Bt(e, `/${encodeURIComponent(t)}`),
    {
      method: "DELETE"
    }
  );
}
async function mo(e, t) {
  return pe(Bt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function po(e, t) {
  return pe(
    Bt(e, "/batch-disable"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t)
    }
  );
}
async function go(e, t) {
  return pe(Bt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Cr(e) {
  return await pe("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function hi(e, t) {
  await pe(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Tr(e, t) {
  return pe("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function fo(e, t) {
  return pe(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Ei(e, t) {
  await pe(
    Bt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function yo(e) {
  await pe(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function ho(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), i = parseInt(n[2] || "0", 10), a = parseInt(n[3] || "0", 10), s = r * 60 + i + Math.round(a / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function Eo(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function bo(e) {
  return pe("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function vo(e, t) {
  return pe("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function wo(e) {
  await pe("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function xo(e) {
  return pe("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function So(e, t) {
  return pe("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ko(e) {
  return (await pe("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function _o(e, t) {
  await pe("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Co() {
  return (await pe("/config/user-timezone")).timezone || "UTC";
}
async function To(e) {
  await pe("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Io(e) {
  return await pe("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
function $o({
  expert: e,
  onRefresh: t,
  onDirtyChange: n
}) {
  const r = P().React, { useState: i, useEffect: a } = r, { Input: s, Select: l, Button: o, Alert: d, message: c } = P().antd, [m, u] = i(null), [p, E] = i(""), [h, y] = i(""), [g, f] = i(!1), x = an(e);
  a(() => {
    let z = !0;
    return gi(e.agent.id).then((A) => {
      z && (u(A), E(JSON.stringify(A)));
    }).catch((A) => {
      z && y(A.message || "无法读取显示配置");
    }), () => {
      z = !1;
    };
  }, [e.agent.id]);
  const v = !!m && JSON.stringify(m) !== p;
  a(() => {
    n(v);
  }, [v, n]);
  const k = (z, A) => u((T) => T && { ...T, [z]: A }), M = async () => {
    if (m) {
      f(!0);
      try {
        const z = await no(e.agent.id, m);
        u(z), E(JSON.stringify(z)), Lt(), t(), c.success("专家显示信息已保存");
      } catch (z) {
        c.error(z.message || "保存失败，修改内容已保留");
      } finally {
        f(!1);
      }
    }
  };
  return h ? r.createElement(d, {
    type: "error",
    showIcon: !0,
    message: "显示配置暂不可用",
    description: h
  }) : m ? r.createElement(
    "div",
    null,
    r.createElement("h3", null, "基本信息"),
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
          onChange: (z) => k("display_name", z.target.value)
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
          onChange: (z) => k("category", z === "auto" ? null : z),
          options: [
            { value: "auto", label: `自动分类 · ${x.category}` },
            ...pi.slice(1).map((z) => ({
              value: z,
              label: z
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
          onChange: (z) => k("specialty", z.target.value)
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
          onChange: (z) => k("summary", z.target.value)
        })
      )
    ),
    r.createElement(
      "div",
      { className: "ugsci-settings-save" },
      r.createElement(
        "span",
        { role: "status" },
        v ? "有未保存的修改" : "修改仅用于专家卡片展示"
      ),
      r.createElement(
        o,
        { type: "primary", loading: g, disabled: !v, onClick: M },
        "保存基本信息"
      )
    )
  ) : r.createElement("p", null, "正在读取显示配置…");
}
function ga(e) {
  return Ln(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function fa(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ln(`/ugsci/avatar/team/${t}`);
}
function it({
  name: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = P().React, [i, a] = r.useState(0), s = i === 0 ? ga(e) : `${ga(e)}?_r=${i}`;
  return r.createElement("img", {
    src: s,
    alt: e,
    onError: () => {
      i < 1 && a(i + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: n,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
function Ir({
  members: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = P().React, [i, a] = r.useState(0);
  if (!e || e.length === 0)
    return r.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const s = e.slice(0, 5), l = i === 0 ? fa(s) : `${fa(s)}?_r=${i}`;
  return r.createElement("img", {
    src: l,
    alt: "team",
    onError: () => {
      i < 1 && a(i + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: n,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
function bi(e, t, n) {
  const { useRef: r, useEffect: i } = P().React, a = r(null), s = JSON.stringify(t);
  return i(() => {
    e || (a.current === null && (a.current = s), n == null || n(a.current !== s));
  }, [e, s, n]), () => {
    a.current = s, n == null || n(!1);
  };
}
const ya = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function vi({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: i,
  onInstall: a
}) {
  const s = P().React, { useState: l, useEffect: o, useMemo: d } = s, { Modal: c, Button: m, Empty: u, Spin: p, Input: E, Tag: h, Tooltip: y, Typography: g } = P().antd, { CheckOutlined: f, SearchOutlined: x } = P().antdIcons || {}, { Text: v } = g, [k, M] = l([]), [z, A] = l("");
  o(() => {
    e && (M([]), A(""));
  }, [e]);
  const T = d(() => {
    if (!z.trim()) return n;
    const $ = z.toLowerCase();
    return n.filter(
      (I) => {
        var R, S;
        return I.name.toLowerCase().includes($) || ((R = I.description) == null ? void 0 : R.toLowerCase().includes($)) || ((S = I.tags) == null ? void 0 : S.some((j) => j.toLowerCase().includes($)));
      }
    );
  }, [n, z]), F = T.filter(
    ($) => !r.includes($.name)
  ), G = ($) => {
    M(
      (I) => I.includes($) ? I.filter((R) => R !== $) : [...I, $]
    );
  }, _ = async () => {
    k.length !== 0 && (await a(k), M([]));
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
          `已选择 ${k.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(m, { onClick: t }, "取消"),
          s.createElement(
            m,
            {
              type: "primary",
              onClick: _,
              disabled: k.length === 0
            },
            k.length > 0 ? `添加 (${k.length})` : "添加"
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
      s.createElement(E, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: x ? s.createElement(x) : void 0,
        value: z,
        onChange: ($) => A($.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        m,
        {
          size: "small",
          type: "primary",
          onClick: () => M(F.map(($) => $.name))
        },
        "全选"
      ),
      s.createElement(
        m,
        {
          size: "small",
          onClick: () => M([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    i ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(p, { size: "large" })
    ) : T.length === 0 ? s.createElement(u, {
      description: z ? "未找到匹配的技能" : "技能池暂无可用技能",
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
      ...T.map(($) => {
        const I = k.includes($.name), R = r.includes($.name);
        return s.createElement(
          "div",
          {
            key: $.name,
            onClick: () => !R && G($.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${I ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: R ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: I ? "rgba(0, 114, 245, 0.06)" : R ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: R ? 0.5 : 1,
              minHeight: 64
            }
          },
          I ? s.createElement(
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
            f ? s.createElement(f) : "✓"
          ) : null,
          R ? s.createElement(
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
                paddingRight: R || I ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              $.emoji || "⚡"
            ),
            s.createElement(
              y,
              { title: $.name },
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
                $.name
              )
            )
          ),
          $.description ? s.createElement(
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
            $.description
          ) : null,
          $.tags && $.tags.length > 0 ? s.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...$.tags.slice(0, 2).map(
              (S, j) => s.createElement(
                h,
                {
                  key: j,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                S
              )
            )
          ) : null
        );
      })
    )
  );
}
function wi({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n,
  onDirtyChange: r
}) {
  const i = P().React, { useState: a, useEffect: s, useCallback: l, useRef: o } = i, {
    List: d,
    Tag: c,
    Switch: m,
    Button: u,
    Modal: p,
    Input: E,
    Spin: h,
    Empty: y,
    message: g,
    Typography: f,
    Segmented: x,
    Alert: v
  } = P().antd, { FileTextOutlined: k, PlusOutlined: M, EditOutlined: z, ReloadOutlined: A } = P().antdIcons || {}, { Text: T } = f, [F, G] = p.useModal(), [_, $] = a([]), [I, R] = a(!0), [S, j] = a(
    t || []
  ), [q, L] = a(!1), [N, J] = a(null), [B, O] = a(""), [K, U] = a(""), [ie, ue] = a(!1), [le, ae] = a("source"), Q = o(0), W = o("");
  s(() => {
    r == null || r(
      q && `${K}
${B}` !== W.current
    );
  }, [q, K, B, r]);
  const ee = l(async () => {
    const de = ++Q.current;
    R(!0);
    try {
      const Y = await so(e);
      de === Q.current && $(Y);
    } catch (Y) {
      de === Q.current && (g.error(Y.message || "加载工作区文档失败"), $([]));
    } finally {
      de === Q.current && R(!1);
    }
  }, [e]);
  s(() => {
    ee();
  }, [ee]), s(() => {
    j(t || []);
  }, [t]);
  const X = async (de, Y) => {
    const be = new Set(S);
    if (Y)
      be.add(de);
    else {
      if (ya.includes(de) && de === "AGENTS.md") {
        g.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      be.delete(de);
    }
    const ke = Array.from(be);
    j(ke);
    try {
      await uo(e, ke), g.success(Y ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (Ae) {
      g.error(Ae.message || "更新失败"), j(t || []);
    }
  }, D = async (de) => {
    try {
      const Y = await pe(
        `/workspace/files/${encodeURIComponent(de)}`,
        { headers: { "X-Agent-Id": e } }
      );
      W.current = `${K}
${Y.content || ""}`, J(de), O(Y.content || ""), ae("source"), L(!0);
    } catch (Y) {
      g.error(Y.message || "读取文件失败");
    }
  }, me = () => {
    W.current = `
`, J(null), O(""), U(""), ae("source"), L(!0);
  }, ve = async () => {
    let de;
    try {
      de = co(N || K);
    } catch (Y) {
      g.warning(Y.message || "文件名无效");
      return;
    }
    if (!B.trim()) {
      g.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(B).length > 1024 * 1024) {
      g.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    ue(!0);
    try {
      if (N)
        await At(e, de, B);
      else {
        const Y = await oo(
          e,
          de,
          B,
          !0
        );
        j(Y.system_prompt_files);
      }
      g.success("保存成功"), L(!1), ee(), n();
    } catch (Y) {
      const be = Y != null && Y.message ? `：${Y.message}` : "";
      g.error(
        N ? (Y == null ? void 0 : Y.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${be}`
      );
    } finally {
      ue(!1);
    }
  };
  return I ? i.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    i.createElement(h, { size: "large" })
  ) : i.createElement(
    "div",
    null,
    G,
    i.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        k ? i.createElement(k, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        i.createElement(
          T,
          { strong: !0 },
          `工作区文档 (${_.length})`
        ),
        i.createElement(
          T,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${S.length} 个已挂载到系统提示`
        )
      ),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        i.createElement(
          u,
          {
            size: "small",
            icon: A ? i.createElement(A) : void 0,
            onClick: ee
          },
          "刷新"
        ),
        i.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: M ? i.createElement(M) : void 0,
            onClick: me
          },
          "新建 Markdown 文档"
        )
      )
    ),
    _.length === 0 ? i.createElement(y, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : i.createElement(d, {
      dataSource: _,
      renderItem: (de) => {
        const Y = S.includes(de.filename), be = ya.includes(de.filename);
        return i.createElement(
          d.Item,
          {
            actions: [
              i.createElement(
                u,
                {
                  type: "link",
                  size: "small",
                  icon: z ? i.createElement(z) : void 0,
                  onClick: () => D(de.filename)
                },
                "编辑"
              )
            ]
          },
          i.createElement(d.Item.Meta, {
            avatar: i.createElement(k, {
              style: {
                fontSize: 20,
                color: Y ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
              }
            }),
            title: i.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              i.createElement(T, null, de.filename),
              be ? i.createElement(
                c,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : i.createElement(
                c,
                { color: "cyan", style: { fontSize: 10 } },
                "工作文档"
              )
            ),
            description: i.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(de.size / 1024).toFixed(1)} KB · 修改于 ${new Date(
                de.modified_time
              ).toLocaleString()}`
            )
          }),
          i.createElement(m, {
            checked: Y,
            size: "small",
            onChange: (ke) => X(de.filename, ke)
          })
        );
      }
    }),
    // Edit/New file modal
    i.createElement(
      p,
      {
        open: q,
        onCancel: () => {
          if (!ie) {
            if (`${K}
${B}` === W.current) {
              L(!1);
              return;
            }
            F.confirm({
              title: "还有未保存的文档修改",
              content: "关闭编辑器将放弃这些修改。",
              okText: "放弃修改",
              cancelText: "继续编辑",
              onOk: () => L(!1)
            });
          }
        },
        title: N ? `编辑 ${N}` : "新建 Markdown 文档",
        width: 700,
        onOk: ve,
        confirmLoading: ie,
        okText: "保存"
      },
      N ? null : i.createElement(
        "div",
        { style: { marginBottom: 12 } },
        i.createElement(E, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: K,
          onChange: (de) => U(de.target.value),
          addonAfter: K.endsWith(".md") ? "" : ".md"
        })
      ),
      i.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 10
          }
        },
        i.createElement(x, {
          size: "small",
          value: le,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (de) => ae(de)
        }),
        i.createElement(
          T,
          { type: "secondary", style: { fontSize: 12 } },
          `${B.length} 字符 · 约 ${Math.ceil(
            B.length / 4
          )} tokens · ${N && S.includes(N) ? "已挂载" : N ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      B.trim() ? null : i.createElement(v, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      le === "source" ? i.createElement(E.TextArea, {
        value: B,
        onChange: (de) => O(de.target.value),
        rows: 14,
        placeholder: `输入 Markdown 内容...

例如：
# 某区块油藏基础参数

- 地层压力: 25 MPa
- 地层温度: 85°C
- 原油密度: 0.85 g/cm³`,
        style: { fontFamily: "monospace", fontSize: 13 }
      }) : i.createElement(
        "div",
        {
          style: {
            minHeight: 320,
            maxHeight: 480,
            overflow: "auto",
            padding: "12px 16px",
            border: "1px solid var(--ant-color-border, #d9d9d9)",
            borderRadius: 6,
            background: "var(--ant-color-bg-container, #fff)"
          }
        },
        xr(B, i)
      )
    )
  );
}
function Ao({
  skills: e,
  agentId: t
}) {
  const n = P().React, { useMemo: r } = n, {
    List: i,
    Tag: a,
    Typography: s,
    Empty: l,
    Button: o,
    message: d
  } = P().antd, { ThunderboltOutlined: c, CopyOutlined: m } = P().antdIcons || {}, { Text: u } = s, p = r(() => fi(e), [e]), E = (y) => {
    try {
      const g = P();
      g.setSelectedAgent && g.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", y.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, h = (y) => {
    var g;
    (g = navigator.clipboard) == null || g.writeText(y.value).then(() => {
      d.success("已复制到剪贴板");
    });
  };
  return p.length === 0 ? n.createElement(l, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: l.PRESENTED_IMAGE_SIMPLE
  }) : n.createElement(
    "div",
    null,
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      c ? n.createElement(c, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      n.createElement(
        u,
        { strong: !0 },
        `推荐提问 (${p.length})`
      ),
      n.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    n.createElement(i, {
      dataSource: p,
      renderItem: (y, g) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              o,
              {
                type: "link",
                size: "small",
                icon: m ? n.createElement(m) : void 0,
                onClick: () => h(y)
              },
              "复制"
            )
          ]
        },
        n.createElement(i.Item.Meta, {
          avatar: n.createElement(
            a,
            { color: "blue", style: { borderRadius: "50%" } },
            `${g + 1}`
          ),
          title: n.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => E(y)
            },
            y.value
          ),
          description: n.createElement(
            u,
            { type: "secondary", style: { fontSize: 12 } },
            y.label
          )
        })
      )
    })
  );
}
const Rt = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "var(--app-text, var(--ant-color-text))",
  display: "flex",
  alignItems: "center",
  gap: 4
}, xi = { marginBottom: 16 }, Si = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, ha = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--app-text, var(--ant-color-text))",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid var(--app-border, var(--ant-color-border-secondary))"
}, ki = {
  fontSize: 12,
  color: "var(--app-text-secondary, var(--ant-color-text-secondary))",
  marginLeft: 8
};
function zo({
  agentId: e,
  onDirtyChange: t
}) {
  const n = P().React, { useState: r, useEffect: i, useCallback: a } = n, {
    Switch: s,
    InputNumber: l,
    Select: o,
    Button: d,
    Spin: c,
    Space: m,
    Typography: u,
    message: p
  } = P().antd, { PlayCircleOutlined: E, SaveOutlined: h } = P().antdIcons || {}, { Text: y } = u, [g, f] = r(!0), [x, v] = r(!1), [k, M] = r(!1), [z, A] = r(!1), [T, F] = r(6), [G, _] = r("h"), [$, I] = r("main"), [R, S] = r(300), [j, q] = r(!1), [L, N] = r("08:00"), [J, B] = r("22:00"), O = bi(
    g,
    {
      enabled: z,
      everyNumber: T,
      everyUnit: G,
      target: $,
      timeoutSeconds: R,
      useActiveHours: j,
      activeHoursStart: L,
      activeHoursEnd: J
    },
    t
  ), K = a(async () => {
    var Q, W;
    f(!0);
    try {
      const ee = await bo(e), X = ho(ee.every ?? "6h");
      A(ee.enabled ?? !1), F(X.number), _(X.unit), I(ee.target ?? "main"), S(ee.timeoutSeconds ?? 300), q(!!ee.activeHours), N(((Q = ee.activeHours) == null ? void 0 : Q.start) ?? "08:00"), B(((W = ee.activeHours) == null ? void 0 : W.end) ?? "22:00");
    } catch (ee) {
      p.error(ee.message || "加载心跳配置失败");
    } finally {
      f(!1);
    }
  }, [e]);
  i(() => {
    K();
  }, [K]);
  const U = async () => {
    v(!0);
    try {
      await vo(e, {
        enabled: z,
        every: Eo({ number: T, unit: G }),
        target: $,
        timeoutSeconds: R,
        activeHours: j && L && J ? { start: L, end: J } : void 0
      }), O(), p.success("心跳配置已保存");
    } catch (Q) {
      p.error(Q.message || "保存心跳配置失败");
    } finally {
      v(!1);
    }
  }, ie = async () => {
    M(!0);
    try {
      await wo(e), p.success("已触发心跳检查");
    } catch (Q) {
      p.error(Q.message || "触发心跳失败");
    } finally {
      M(!1);
    }
  };
  if (g)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(c, { size: "large" })
    );
  const ue = (Q, W, ee) => n.createElement(
    "div",
    { style: xi },
    n.createElement("div", { style: Rt }, Q),
    W,
    ee ? n.createElement(
      y,
      { type: "secondary", style: ki },
      ee
    ) : null
  ), le = (Q, W, ee, X) => n.createElement(
    "div",
    { className: "ugsci-config-pair", style: Si },
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Rt }, Q),
      W
    ),
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Rt }, ee),
      X
    )
  ), { Divider: ae } = P().antd;
  return n.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    n.createElement("div", { style: ha }, "基本设置"),
    ue(
      "启用心跳",
      n.createElement(s, {
        checked: z,
        onChange: (Q) => A(Q)
      }),
      z ? "已启用，专家将定期自检" : "已停用"
    ),
    le(
      "检查频率",
      n.createElement(
        m,
        null,
        n.createElement(l, {
          min: 1,
          value: T,
          onChange: (Q) => F(Q ?? 1),
          style: { width: "100%" }
        }),
        n.createElement(o, {
          value: G,
          onChange: (Q) => _(Q),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      n.createElement(o, {
        value: $,
        onChange: (Q) => I(Q),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    ue(
      "超时时间 (秒)",
      n.createElement(l, {
        min: 1,
        max: 3600,
        value: R,
        onChange: (Q) => S(Q ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    n.createElement(ae, { style: { margin: "8px 0 16px" } }),
    n.createElement("div", { style: ha }, "活跃时段"),
    ue(
      "启用活跃时段限制",
      n.createElement(s, {
        checked: j,
        onChange: (Q) => q(Q)
      }),
      "仅在指定时段内触发心跳"
    ),
    j ? le(
      "开始时间",
      n.createElement("input", {
        type: "time",
        value: L,
        onChange: (Q) => N(Q.target.value),
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
        value: J,
        onChange: (Q) => B(Q.target.value),
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
          icon: h ? n.createElement(h) : void 0,
          loading: x,
          onClick: U,
          style: nt
        },
        "保存配置"
      ),
      n.createElement(
        d,
        {
          icon: E ? n.createElement(E) : void 0,
          loading: k,
          onClick: ie
        },
        "立即执行"
      )
    )
  );
}
function Ro({
  agentId: e,
  onRefresh: t
}) {
  const n = P().React, { useState: r, useEffect: i, useCallback: a } = n, {
    List: s,
    Tag: l,
    Switch: o,
    Button: d,
    Empty: c,
    Spin: m,
    Typography: u,
    message: p
  } = P().antd, { PlusOutlined: E, ReloadOutlined: h, DeleteOutlined: y } = P().antdIcons || {}, { Text: g, Paragraph: f } = u, [x, v] = r([]), [k, M] = r(!0), [z, A] = r(!1), [T, F] = r([]), [G, _] = r(!1), $ = a(async () => {
    M(!0);
    try {
      const L = await jn(e);
      v(L);
    } catch (L) {
      p.error(L.message || "加载技能失败"), v([]);
    } finally {
      M(!1);
    }
  }, [e]);
  i(() => {
    $();
  }, [$]);
  const I = async () => {
    A(!0), _(!0);
    try {
      const L = await Nn(!0);
      F(L);
    } catch (L) {
      p.error(L.message || "加载技能池失败");
    } finally {
      _(!1);
    }
  }, R = async (L) => {
    let N = 0, J = 0;
    for (const B of L)
      try {
        await kr(e, B), N++;
      } catch {
        J++;
      }
    N > 0 ? (p.success(
      `成功添加 ${N} 个技能${J > 0 ? `，${J} 个失败` : ""}`
    ), $(), t()) : J > 0 && p.error("添加技能失败"), A(!1);
  }, S = async (L, N) => {
    try {
      N ? await yi(e, L.name) : await Ei(e, L.name), p.success(N ? "已启用" : "已停用"), $(), t();
    } catch (J) {
      p.error(J.message || "操作失败");
    }
  }, j = async (L) => {
    try {
      await _r(e, L), p.success(`技能「${L}」已移除`), $(), t();
    } catch (N) {
      p.error(N.message || "移除技能失败");
    }
  };
  if (k)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(m, { size: "large" })
    );
  const q = x.filter((L) => L.enabled !== !1);
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
        g,
        { strong: !0 },
        `技能列表 (${x.length}，已启用 ${q.length})`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: h ? n.createElement(h) : void 0,
            onClick: () => {
              Lt(), $();
            }
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: E ? n.createElement(E) : void 0,
            onClick: I,
            style: nt
          },
          "从技能池添加"
        )
      )
    ),
    x.length === 0 ? n.createElement(c, {
      description: "该专家暂无技能",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(s, {
      dataSource: x,
      renderItem: (L) => n.createElement(
        s.Item,
        {
          actions: [
            n.createElement(o, {
              key: "toggle",
              size: "small",
              checked: L.enabled !== !1,
              onChange: (N) => S(L, N)
            }),
            n.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: y ? n.createElement(y) : void 0,
                onClick: () => j(L.name)
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
            L.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              L.emoji
            ) : null,
            n.createElement(g, { strong: !0 }, L.name),
            L.version_text ? n.createElement(
              l,
              { style: { fontSize: 10 } },
              `v${L.version_text}`
            ) : null
          ),
          L.description ? n.createElement(
            f,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            L.description
          ) : null
        )
      )
    }),
    n.createElement(vi, {
      open: z,
      onClose: () => A(!1),
      poolSkills: T,
      installedSkillNames: x.map((L) => L.name),
      loading: G,
      onInstall: R
    })
  );
}
function Po({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = P().React, { useState: i, useEffect: a, useCallback: s } = r, {
    List: l,
    Tag: o,
    Button: d,
    Empty: c,
    Spin: m,
    Modal: u,
    Input: p,
    Typography: E,
    message: h
  } = P().antd, { PlusOutlined: y, ReloadOutlined: g, DeleteOutlined: f } = P().antdIcons || {}, { Text: x, Paragraph: v } = E, { TextArea: k } = p, [M, z] = i([]), [A, T] = i(!0), [F, G] = i(!1), [_, $] = i(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [I, R] = i(!1), S = s(async () => {
    T(!0);
    try {
      const N = await Cr(e);
      z(N);
    } catch (N) {
      h.error(N.message || "加载 MCP 失败"), z([]);
    } finally {
      T(!1);
    }
  }, [e]);
  a(() => {
    S();
  }, [S]), a(() => {
    n && S();
  }, [n, S]);
  const j = async (N) => {
    try {
      await fo(e, N), h.success("已切换 MCP 状态"), S(), t();
    } catch (J) {
      h.error(J.message || "切换失败");
    }
  }, q = async (N) => {
    try {
      await hi(e, N), h.success(`MCP「${N}」已移除`), S(), t();
    } catch (J) {
      h.error(J.message || "移除 MCP 失败");
    }
  }, L = async () => {
    R(!0);
    try {
      const N = JSON.parse(_), J = N.mcpServers || N, B = Object.entries(J);
      if (B.length === 0) {
        h.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [O, K] of B) {
        const U = K, ie = U.url ? "streamable_http" : "stdio";
        await Tr(e, {
          client_key: O,
          client: {
            name: U.name || O,
            description: U.description || "",
            enabled: !0,
            transport: ie,
            url: U.url || "",
            command: U.command || "",
            args: U.args || [],
            env: U.env || {},
            cwd: U.cwd || "",
            headers: U.headers || {}
          }
        });
      }
      h.success("MCP 客户端已创建"), G(!1), S(), t();
    } catch (N) {
      N instanceof SyntaxError ? h.error("JSON 格式错误：" + N.message) : h.error(N.message || "创建 MCP 失败");
    } finally {
      R(!1);
    }
  };
  return A ? r.createElement(
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
        x,
        { strong: !0 },
        `MCP 客户端 (${M.length})`
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          d,
          {
            size: "small",
            icon: g ? r.createElement(g) : void 0,
            onClick: () => {
              Lt(), S();
            }
          },
          "刷新"
        ),
        r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: y ? r.createElement(y) : void 0,
            onClick: () => G(!0),
            style: nt
          },
          "添加 MCP"
        )
      )
    ),
    M.length === 0 ? r.createElement(c, {
      description: "该专家暂无 MCP 客户端",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(l, {
      dataSource: M,
      renderItem: (N) => r.createElement(
        l.Item,
        {
          actions: [
            r.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => j(N.key)
              },
              N.enabled ? "停用" : "启用"
            ),
            r.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: f ? r.createElement(f) : void 0,
                onClick: () => q(N.key)
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
              x,
              { strong: !0 },
              N.name || N.key
            ),
            r.createElement(
              o,
              {
                color: N.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              N.enabled ? "启用" : "停用"
            ),
            r.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              N.transport
            )
          ),
          N.description ? r.createElement(
            v,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            N.description
          ) : null,
          N.tools && N.tools.length > 0 ? r.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${N.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    r.createElement(
      u,
      {
        open: F,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => G(!1),
        onOk: L,
        confirmLoading: I,
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
      r.createElement(k, {
        value: _,
        onChange: (N) => $(N.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Oo({
  agentId: e,
  onDirtyChange: t
}) {
  const n = P().React, { useState: r, useEffect: i, useCallback: a, useRef: s } = n, {
    Card: l,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: m,
    Button: u,
    Spin: p,
    Space: E,
    Typography: h,
    Divider: y,
    message: g
  } = P().antd, { SaveOutlined: f } = P().antdIcons || {}, { Text: x } = h, [v, k] = r(!0), [M, z] = r(!1), A = s(null), [T, F] = r(60), [G, _] = r(""), [$, I] = r(!0), [R, S] = r(30), [j, q] = r("zh"), [L, N] = r("UTC"), [J, B] = r(!0), [O, K] = r(100), [U, ie] = r(!0), [ue, le] = r(3), [ae, Q] = r(1), [W, ee] = r(!0), [X, D] = r(3), [me, ve] = r(2), [de, Y] = r(60), [be, ke] = r(1), [Ae, Re] = r(0), [Se, fe] = r(1), [ye, we] = r(0), [b, V] = r(30), [C, re] = r(50), [ge, Z] = r("light"), [he, xe] = r("scroll"), [Ie, Ge] = r("remelight"), [qe, rt] = r("AUTO"), Ye = bi(
    v,
    {
      shellTimeout: T,
      shellExecutable: G,
      autoTitleEnabled: $,
      autoTitleTimeout: R,
      language: j,
      timezone: L,
      iterEnabled: J,
      maxIters: O,
      doomLoopEnabled: U,
      doomWindowSize: ue,
      doomSimilarity: ae,
      llmRetryEnabled: W,
      llmMaxRetries: X,
      llmBackoffBase: me,
      llmBackoffCap: de,
      llmMaxConcurrent: be,
      llmMaxQpm: Ae,
      llmRateLimitPause: Se,
      llmRateLimitJitter: ye,
      llmAcquireTimeout: b,
      historyMaxLength: C,
      contextBackend: ge,
      contextStrategy: he,
      memoryBackend: Ie,
      approvalLevel: qe
    },
    t
  ), H = a(async () => {
    var ce, Be, Ne, He, st, Je;
    k(!0);
    try {
      const [$e, dt, ot] = await Promise.all([
        xo(e),
        ko(e).catch(() => "zh"),
        Co().catch(() => "UTC")
      ]);
      A.current = $e, F($e.shell_command_timeout ?? 60), _($e.shell_command_executable ?? "");
      const De = $e.auto_title_config ?? {
        enabled: !0,
        timeout_seconds: 30
      };
      I(De.enabled ?? !0), S(De.timeout_seconds ?? 30), q(dt), N(ot);
      const Oe = $e.loop ?? {};
      B(((ce = Oe.iteration) == null ? void 0 : ce.enabled) ?? !0), K(((Be = Oe.iteration) == null ? void 0 : Be.max_iterations) ?? $e.max_iters ?? 100), ie(((Ne = Oe.doom_loop) == null ? void 0 : Ne.enabled) ?? !0), le(((He = Oe.doom_loop) == null ? void 0 : He.window_size) ?? 3), Q(((st = Oe.doom_loop) == null ? void 0 : st.similarity_threshold) ?? 1), ee($e.llm_retry_enabled ?? !0), D($e.llm_max_retries ?? 3), ve($e.llm_backoff_base ?? 2), Y($e.llm_backoff_cap ?? 60), ke($e.llm_max_concurrent ?? 1), Re($e.llm_max_qpm ?? 0), fe($e.llm_rate_limit_pause ?? 1), we($e.llm_rate_limit_jitter ?? 0), V($e.llm_acquire_timeout ?? 30), re($e.history_max_length ?? 50), Z($e.context_manager_backend ?? "light"), xe(((Je = $e.light_context_config) == null ? void 0 : Je.strategy) ?? "scroll"), Ge($e.memory_manager_backend ?? "remelight"), rt($e.approval_level ?? "AUTO");
    } catch ($e) {
      g.error($e.message || "加载运行配置失败");
    } finally {
      k(!1);
    }
  }, [e]);
  i(() => {
    H();
  }, [H]);
  const Ee = async () => {
    var Be, Ne;
    const ce = A.current;
    if (ce) {
      z(!0);
      try {
        const He = {
          ...ce,
          max_iters: O,
          loop: {
            ...ce.loop ?? {},
            iteration: { enabled: J, max_iterations: O },
            doom_loop: {
              enabled: U,
              window_size: ue,
              similarity_threshold: ae,
              stages: ((Ne = (Be = ce.loop) == null ? void 0 : Be.doom_loop) == null ? void 0 : Ne.stages) ?? []
            }
          },
          shell_command_timeout: T,
          shell_command_executable: G,
          auto_title_config: {
            enabled: $,
            timeout_seconds: R
          },
          llm_retry_enabled: W,
          llm_max_retries: X,
          llm_backoff_base: me,
          llm_backoff_cap: de,
          llm_max_concurrent: be,
          llm_max_qpm: Ae,
          llm_rate_limit_pause: Se,
          llm_rate_limit_jitter: ye,
          llm_acquire_timeout: b,
          history_max_length: C,
          context_manager_backend: ge,
          light_context_config: {
            ...ce.light_context_config ?? {},
            strategy: he
          },
          memory_manager_backend: Ie,
          approval_level: qe
        };
        await So(e, He), A.current = He, j && await _o(e, j), L && await To(L), Ye(), g.success("运行配置已保存");
      } catch (He) {
        g.error(He.message || "保存运行配置失败");
      } finally {
        z(!1);
      }
    }
  };
  if (v)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(p, { size: "large" })
    );
  const Pe = (ce, Be, Ne) => n.createElement(
    "div",
    { style: xi },
    n.createElement("div", { style: Rt }, ce),
    Be,
    Ne ? n.createElement(
      x,
      { type: "secondary", style: ki },
      Ne
    ) : null
  ), Fe = (ce, Be, Ne, He) => n.createElement(
    "div",
    { className: "ugsci-config-pair", style: Si },
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Rt }, ce),
      Be
    ),
    n.createElement(
      "div",
      null,
      n.createElement("div", { style: Rt }, Ne),
      He
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
      Fe(
        "Shell 命令超时 (秒)",
        n.createElement(o, {
          min: 1,
          value: T,
          onChange: (ce) => F(ce ?? 60),
          style: { width: "100%" }
        }),
        "Shell 可执行文件",
        n.createElement(d, {
          value: G,
          onChange: (ce) => _(ce.target.value),
          placeholder: "留空使用系统默认",
          style: { width: "100%" }
        })
      ),
      Fe(
        "语言",
        n.createElement(c, {
          value: j,
          onChange: (ce) => q(ce),
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
          value: L,
          onChange: (ce) => N(ce),
          style: { width: "100%" },
          showSearch: !0,
          filterOption: (ce, Be) => {
            var Ne;
            return (((Ne = Be == null ? void 0 : Be.label) == null ? void 0 : Ne.toString()) || "").toLowerCase().includes(ce.toLowerCase());
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
          ].map((ce) => ({ value: ce, label: ce }))
        })
      ),
      Fe(
        "自动生成会话标题",
        n.createElement(
          E,
          null,
          n.createElement(m, {
            checked: $,
            onChange: (ce) => I(ce)
          })
        ),
        "标题生成超时 (秒)",
        n.createElement(o, {
          min: 5,
          value: R,
          onChange: (ce) => S(ce ?? 30),
          style: { width: "100%" },
          disabled: !$
        })
      )
      // ── Section: 审批级别 ──
    ),
    n.createElement(
      "details",
      { className: "ugsci-config-section", open: void 0 },
      n.createElement("summary", null, "审批级别"),
      Pe(
        "工具执行审批",
        n.createElement(c, {
          value: qe,
          onChange: (ce) => rt(ce),
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
      Pe(
        "启用迭代限制",
        n.createElement(m, {
          checked: J,
          onChange: (ce) => B(ce)
        }),
        "停止 Agent 前的最大循环轮次"
      ),
      J ? Pe(
        "最大迭代次数",
        n.createElement(o, {
          min: 1,
          max: 500,
          value: O,
          onChange: (ce) => K(ce ?? 100),
          style: { width: "100%" }
        })
      ) : null,
      Pe(
        "启用重复循环保护",
        n.createElement(m, {
          checked: U,
          onChange: (ce) => ie(ce)
        }),
        "检测并阻止重复操作循环"
      ),
      U ? Fe(
        "检测窗口大小",
        n.createElement(o, {
          min: 2,
          max: 20,
          value: ue,
          onChange: (ce) => le(ce ?? 3),
          style: { width: "100%" }
        }),
        "相似度阈值",
        n.createElement(o, {
          min: 0,
          max: 1,
          step: 0.05,
          value: ae,
          onChange: (ce) => Q(ce ?? 1),
          style: { width: "100%" }
        })
      ) : null
      // ── Section: LLM 重试 ──
    ),
    n.createElement(
      "details",
      { className: "ugsci-config-section", open: void 0 },
      n.createElement("summary", null, "LLM 重试"),
      Pe(
        "启用 LLM 重试",
        n.createElement(m, {
          checked: W,
          onChange: (ce) => ee(ce)
        })
      ),
      Fe(
        "最大重试次数",
        n.createElement(o, {
          min: 1,
          value: X,
          onChange: (ce) => D(ce ?? 3),
          style: { width: "100%" },
          disabled: !W
        }),
        "退避基数 (秒)",
        n.createElement(o, {
          min: 0.1,
          step: 0.1,
          value: me,
          onChange: (ce) => ve(ce ?? 2),
          style: { width: "100%" },
          disabled: !W
        })
      ),
      Pe(
        "退避上限 (秒)",
        n.createElement(o, {
          min: 0.5,
          step: 0.5,
          value: de,
          onChange: (ce) => Y(ce ?? 60),
          style: { width: 200 },
          disabled: !W
        })
      )
      // ── Section: LLM 限流 ──
    ),
    n.createElement(
      "details",
      { className: "ugsci-config-section", open: void 0 },
      n.createElement("summary", null, "LLM 限流"),
      Fe(
        "最大并发数",
        n.createElement(o, {
          min: 1,
          value: be,
          onChange: (ce) => ke(ce ?? 1),
          style: { width: "100%" }
        }),
        "最大 QPM (0=不限)",
        n.createElement(o, {
          min: 0,
          step: 10,
          value: Ae,
          onChange: (ce) => Re(ce ?? 0),
          style: { width: "100%" }
        })
      ),
      Fe(
        "限流暂停时间 (秒)",
        n.createElement(o, {
          min: 1,
          step: 0.5,
          value: Se,
          onChange: (ce) => fe(ce ?? 1),
          style: { width: "100%" }
        }),
        "限流抖动 (秒)",
        n.createElement(o, {
          min: 0,
          step: 0.5,
          value: ye,
          onChange: (ce) => we(ce ?? 0),
          style: { width: "100%" }
        })
      ),
      Pe(
        "获取超时 (秒)",
        n.createElement(o, {
          min: 10,
          step: 10,
          value: b,
          onChange: (ce) => V(ce ?? 30),
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
      Fe(
        "上下文管理后端",
        n.createElement(c, {
          value: ge,
          onChange: (ce) => Z(ce),
          style: { width: "100%" },
          options: [{ value: "light", label: "light" }]
        }),
        "上下文策略",
        n.createElement(c, {
          value: he,
          onChange: (ce) => xe(ce),
          style: { width: "100%" },
          options: [
            { value: "scroll", label: "scroll (滚动窗口)" },
            { value: "native", label: "native (原生)" }
          ]
        })
      ),
      Fe(
        "记忆管理后端",
        n.createElement(c, {
          value: Ie,
          onChange: (ce) => Ge(ce),
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
          value: C,
          onChange: (ce) => re(ce ?? 50),
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
          icon: f ? n.createElement(f) : void 0,
          loading: M,
          onClick: Ee,
          style: nt
        },
        "保存运行配置"
      )
    )
  );
}
function Mo({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const i = P().React, { useState: a, useEffect: s, useMemo: l, useRef: o } = i, { Modal: d, Tabs: c, Button: m } = P().antd, [u, p] = d.useModal(), [E, h] = a("basic"), [y, g] = a([]), [f, x] = a(
    () => window.matchMedia("(max-width: 680px)").matches
  ), v = o({}), k = l(
    () => Object.fromEntries(
      ["basic", "files", "heartbeat", "running"].map((I) => [
        I,
        (R) => {
          v.current[I] = R;
        }
      ])
    ),
    []
  ), M = e == null ? void 0 : e.agent.id, z = o(0), A = async () => {
    var R;
    if (!M) return;
    const I = ++z.current;
    try {
      const S = await Io(M);
      I === z.current && g(S);
    } catch {
      I === z.current && g(((R = e == null ? void 0 : e.config) == null ? void 0 : R.system_prompt_files) || []);
    }
  };
  if (s(() => {
    const I = window.matchMedia("(max-width: 680px)"), R = () => x(I.matches);
    return I.addEventListener("change", R), () => I.removeEventListener("change", R);
  }, []), s(() => (v.current = {}, h("basic"), g([]), t && A(), () => {
    z.current++;
  }), [M, t]), s(() => {
    const I = (R) => {
      t && Object.values(v.current).some(Boolean) && (R.preventDefault(), R.returnValue = "");
    };
    return window.addEventListener("beforeunload", I), () => window.removeEventListener("beforeunload", I);
  }, [t]), !e) return null;
  const T = e.agent, F = an(e), G = () => {
    Object.values(v.current).some(Boolean) ? u.confirm({
      title: "还有未保存的修改",
      content: "关闭后将放弃未保存的内容。已保存的配置不受影响。",
      okText: "放弃修改",
      cancelText: "继续编辑",
      onOk: () => {
        v.current = {}, n();
      }
    }) : n();
  }, _ = (I, R, S) => i.createElement(
    "div",
    null,
    i.createElement("h3", null, I),
    i.createElement("p", { className: "ugsci-settings-intro" }, R),
    S
  ), $ = [
    {
      key: "basic",
      label: "基本信息",
      children: i.createElement($o, {
        key: T.id,
        expert: e,
        onRefresh: r,
        onDirtyChange: k.basic
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((I) => I.enabled !== !1).length})`,
      children: _(
        "技能",
        "管理专家可用的技能，启用、停用与安装操作即时生效。",
        i.createElement(Ro, { agentId: T.id, onRefresh: r })
      )
    },
    {
      key: "files",
      label: "文件与提示词",
      children: _(
        "文件与提示词",
        "保留现有工作区文件与系统提示词挂载关系。",
        i.createElement(wi, {
          agentId: T.id,
          systemPromptFiles: y,
          onRefresh: () => {
            A(), r();
          },
          onDirtyChange: k.files
        })
      )
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: _(
        "MCP 服务",
        "配置、连接和工具权限沿用当前专家的独立设置。",
        i.createElement(Po, {
          agentId: T.id,
          onRefresh: r,
          isActive: E === "mcp"
        })
      )
    },
    {
      key: "heartbeat",
      label: "自动检查",
      children: _(
        "自动检查",
        "按固定间隔唤醒专家执行心跳任务。",
        i.createElement(zo, {
          agentId: T.id,
          onDirtyChange: k.heartbeat
        })
      )
    },
    {
      key: "running",
      label: "高级运行",
      children: _(
        "高级运行",
        "按需展开参数组，修改后保存运行配置。",
        i.createElement(Oo, {
          agentId: T.id,
          onDirtyChange: k.running
        })
      )
    }
  ];
  return i.createElement(
    i.Fragment,
    null,
    p,
    i.createElement("style", null, ui),
    i.createElement(
      d,
      {
        open: t,
        title: "专家设置",
        className: "ugsci-expert-settings",
        onCancel: G,
        footer: i.createElement(
          "div",
          { className: "ugsci-settings-footer" },
          i.createElement(
            "span",
            null,
            "各栏目分别保存；技能与 MCP 操作即时生效。"
          ),
          i.createElement(
            m,
            { onClick: G, "aria-label": "关闭设置" },
            "关闭"
          )
        ),
        width: 940,
        centered: !0,
        styles: {
          body: {
            maxHeight: "calc(100dvh - 200px)",
            overflowY: "auto",
            overflowX: "hidden"
          },
          footer: { margin: 0, textAlign: "start" }
        }
      },
      t ? i.createElement(
        i.Fragment,
        { key: T.id },
        i.createElement(
          "div",
          { className: "ugsci-expert-settings-identity" },
          i.createElement(it, { name: T.name, size: 36 }),
          i.createElement(
            "div",
            null,
            i.createElement("strong", null, F.name),
            i.createElement(
              "small",
              null,
              `${T.id} · ${F.category}`
            )
          )
        ),
        i.createElement(c, {
          className: "ugsci-settings-tabs",
          items: $,
          activeKey: E,
          onChange: h,
          tabPosition: f ? "top" : "left",
          destroyOnHidden: !1,
          size: "small"
        })
      ) : null
    )
  );
}
async function Ea(e) {
  var n;
  const t = P();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (r) {
      console.warn("[ugsci] Failed to refresh newly created agent:", r);
      return;
    }
  (n = t.setSelectedAgent) == null || n.call(t, e);
}
function Lo({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r
}) {
  const i = P().React, { Card: a, Badge: s, Button: l } = P().antd, { SettingOutlined: o } = P().antdIcons || {}, { agent: d } = e, c = an(e);
  return i.createElement(
    a,
    {
      className: "ugsci-expert-card",
      size: "small",
      style: { opacity: d.enabled ? 1 : 0.7 },
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
      i.createElement(it, { name: d.name, size: 36 }),
      i.createElement(
        "div",
        { className: "ugsci-expert-identity" },
        i.createElement(
          "button",
          { type: "button", className: "ugsci-expert-name", onClick: t },
          c.name
        ),
        i.createElement(
          "div",
          { className: "ugsci-expert-specialty" },
          c.specialty
        )
      ),
      i.createElement(
        "span",
        { className: "ugsci-expert-status" },
        i.createElement(s, {
          status: d.enabled ? "success" : "default",
          text: d.enabled ? "启用" : "停用"
        })
      )
    ),
    i.createElement(
      "p",
      { className: "ugsci-expert-summary", title: c.summary },
      c.summary
    ),
    i.createElement(
      "div",
      { className: "ugsci-expert-tags" },
      c.tags.length ? c.tags.map(
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
        l,
        {
          type: "text",
          size: "small",
          "aria-label": `设置 ${c.name}`,
          icon: o ? i.createElement(o) : void 0,
          onClick: r
        },
        "设置"
      ),
      i.createElement(
        l,
        { type: "link", size: "small", onClick: t },
        "查看详情"
      ),
      i.createElement(
        l,
        {
          type: "primary",
          size: "small",
          disabled: !d.enabled,
          onClick: n
        },
        d.managed_by_app ? "打开应用" : "开始对话"
      )
    )
  );
}
function Bo({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r,
  onSummon: i
}) {
  const a = P().React, {
    Drawer: s,
    Descriptions: l,
    Tag: o,
    Typography: d,
    Space: c,
    Button: m,
    Empty: u,
    Tabs: p,
    List: E,
    Spin: h,
    Modal: y,
    message: g
  } = P().antd, { Text: f, Paragraph: x } = d, {
    EditOutlined: v,
    ThunderboltOutlined: k,
    FileTextOutlined: M,
    ToolOutlined: z,
    PlusOutlined: A
  } = P().antdIcons || {}, [T, F] = a.useState(!1), [G, _] = a.useState(
    []
  ), [$, I] = a.useState(!1);
  if (!e) return null;
  const { agent: R, config: S, skills: j, mcps: q, loading: L } = e, N = j.filter((W) => W.enabled !== !1), J = (W) => {
    window.history.pushState({}, "", W), window.dispatchEvent(new PopStateEvent("popstate"));
  }, B = a.createElement(
    "div",
    null,
    a.createElement(
      l,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(l.Item, { label: "专家名称" }, R.name),
      a.createElement(
        l.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, R.id)
      ),
      a.createElement(
        l.Item,
        { label: "状态" },
        a.createElement(
          o,
          { color: R.enabled ? "green" : "default" },
          R.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        l.Item,
        { label: "功能简介" },
        R.description ? xr(R.description, a) : "暂无描述"
      ),
      a.createElement(
        l.Item,
        { label: "使用模型" },
        R.active_model ? `${R.active_model.provider_id} / ${R.active_model.model}` : "使用全局默认模型"
      ),
      S != null && S.workspace_dir ? a.createElement(
        l.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          S.workspace_dir
        )
      ) : null,
      S != null && S.approval_level ? a.createElement(
        l.Item,
        { label: "审批级别" },
        S.approval_level
      ) : null
    ),
    // System prompt files
    S != null && S.system_prompt_files && S.system_prompt_files.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: 16 } },
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        M ? a.createElement(M, {
          style: { fontSize: 14, color: "var(--app-action-link)" }
        }) : null,
        a.createElement(f, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ...S.system_prompt_files.map(
          (W, ee) => a.createElement(
            o,
            {
              key: ee,
              icon: M ? a.createElement(M) : void 0,
              style: { fontSize: 12 }
            },
            W
          )
        )
      )
    ) : null
  ), O = async () => {
    F(!0), I(!0);
    try {
      const W = await Nn(!0);
      _(W);
    } catch (W) {
      g.error(W.message || "加载技能池失败");
    } finally {
      I(!1);
    }
  }, K = async (W) => {
    let ee = 0, X = 0;
    for (const D of W)
      try {
        await kr(R.id, D), ee++;
      } catch {
        X++;
      }
    ee > 0 ? (g.success(
      `成功添加 ${ee} 个技能${X > 0 ? `，${X} 个失败` : ""}`
    ), r()) : X > 0 && g.error("添加技能失败"), F(!1);
  }, U = async (W) => {
    try {
      await _r(R.id, W), g.success(`技能「${W}」已移除`), r();
    } catch (ee) {
      g.error(ee.message || "移除技能失败");
    }
  }, ie = async (W) => {
    try {
      await hi(R.id, W), g.success(`MCP「${W}」已移除`), r();
    } catch (ee) {
      g.error(ee.message || "移除 MCP 失败");
    }
  }, ue = L ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(h, { size: "large" })
  ) : a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      a.createElement(
        f,
        { strong: !0 },
        `已启用技能 (${N.length})`
      ),
      a.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: A ? a.createElement(A) : void 0,
          onClick: O
        },
        "从技能池添加"
      )
    ),
    N.length === 0 ? a.createElement(u, {
      description: "该专家暂无已启用的技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(E, {
      dataSource: N,
      renderItem: (W) => a.createElement(
        E.Item,
        {
          actions: [
            a.createElement(
              m,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => U(W.name)
              },
              "移除"
            )
          ]
        },
        a.createElement(
          "div",
          { style: { width: "100%" } },
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            W.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              W.emoji
            ) : null,
            a.createElement(f, { strong: !0 }, W.name),
            W.version_text ? a.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${W.version_text}`
            ) : null
          ),
          W.description ? a.createElement(
            x,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            W.description
          ) : null,
          W.tags && W.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...W.tags.map(
              (ee, X) => a.createElement(
                o,
                {
                  key: X,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                ee
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    a.createElement(vi, {
      open: T,
      onClose: () => F(!1),
      poolSkills: G,
      installedSkillNames: N.map((W) => W.name),
      loading: $,
      onInstall: K
    })
  ), le = L ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(h, { size: "large" })
  ) : a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      a.createElement(
        f,
        { strong: !0 },
        `MCP 客户端 (${q.length})`
      ),
      a.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: A ? a.createElement(A) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${R.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    q.length === 0 ? a.createElement(u, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(E, {
      dataSource: q,
      renderItem: (W) => a.createElement(
        E.Item,
        {
          actions: [
            a.createElement(
              m,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => ie(W.key)
              },
              "移除"
            )
          ]
        },
        a.createElement(
          "div",
          { style: { width: "100%" } },
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            a.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            a.createElement(
              f,
              { strong: !0 },
              W.name || W.key
            ),
            a.createElement(
              o,
              {
                color: W.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              W.enabled ? "启用" : "停用"
            ),
            a.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              W.transport
            )
          ),
          W.description ? a.createElement(
            x,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            W.description
          ) : null,
          W.tools && W.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--app-card-muted, #8c8c8c)"
              }
            },
            `提供 ${W.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), ae = S != null && S.tools ? a.createElement(
    "div",
    { style: { padding: 16 } },
    a.createElement(
      "div",
      { style: { marginBottom: 12 } },
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        z ? a.createElement(z, {
          style: { fontSize: 14, color: "var(--app-action-link)" }
        }) : null,
        a.createElement(f, { strong: !0 }, "工具配置")
      ),
      a.createElement(
        "pre",
        {
          style: {
            background: "var(--app-fill-faint, #fafafa)",
            padding: 12,
            borderRadius: 6,
            fontSize: 12,
            overflow: "auto",
            maxHeight: 300
          }
        },
        JSON.stringify(S.tools, null, 2)
      )
    )
  ) : a.createElement(u, {
    description: "暂无工具配置",
    image: u.PRESENTED_IMAGE_SIMPLE
  }), Q = [
    { key: "basic", label: "基本信息", children: B },
    {
      key: "skills",
      label: `技能 (${N.length})`,
      children: ue
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(Ao, {
        skills: N,
        agentId: R.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(wi, {
        agentId: R.id,
        systemPromptFiles: (S == null ? void 0 : S.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${q.length})`, children: le },
    { key: "tools", label: "工具配置", children: ae }
  ];
  return a.createElement(
    s,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(it, { name: R.name, size: 28 }),
        a.createElement("span", null, R.name)
      ),
      open: t,
      onClose: n,
      width: 560,
      extra: a.createElement(
        c,
        null,
        a.createElement(
          m,
          {
            size: "small",
            icon: v ? a.createElement(v) : void 0,
            onClick: () => {
              n();
              try {
                const W = P();
                W.setSelectedAgent && W.setSelectedAgent(R.id);
              } catch (W) {
                console.warn("[ugsci] Failed to set selected agent:", W);
              }
              setTimeout(() => J("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: k ? a.createElement(k) : void 0,
            disabled: !R.enabled,
            onClick: () => {
              n(), i(e);
            }
          },
          R.managed_by_app ? "打开应用" : "开始对话"
        )
      )
    },
    a.createElement(p, {
      items: Q,
      defaultActiveKey: "basic"
    })
  );
}
function jo({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = P().React, { useState: i } = r, {
    Modal: a,
    Card: s,
    Tag: l,
    Input: o,
    Row: d,
    Col: c,
    Spin: m,
    message: u,
    Typography: p
  } = P().antd, { Text: E } = p, { FileAddOutlined: h } = P().antdIcons || {}, [y, g] = i(!1), [f, x] = i(""), [v, k] = i(!1), M = async (T) => {
    g(!0);
    try {
      const F = await pe("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: T.id || void 0,
          name: T.name,
          description: T.description,
          skill_names: T.skillNames
        })
      }), G = T.systemPrompt.trim() || `# ${T.name}

你是${T.name}。${T.description ? `

职责：${T.description}` : ""}
`, $ = (await Promise.allSettled([
        At(F.id, "AGENTS.md", G),
        ...T.mcpClients.map(
          ({ clientKey: I, client: R }) => Tr(F.id, {
            client_key: I,
            client: R
          })
        )
      ])).filter(
        (I) => I.status === "rejected"
      ).length;
      $ > 0 ? u.warning(
        `专家「${T.name}」已创建，${$} 项初始配置失败，可在专家配置中重试`
      ) : u.success(`专家「${T.name}」创建成功`), await Ea(F.id), k(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (F) {
      u.error(F.message || "创建专家失败");
    } finally {
      g(!1);
    }
  }, z = to.filter((T) => {
    if (!f.trim()) return !0;
    const F = f.toLowerCase();
    return T.name.toLowerCase().includes(F) || T.description.toLowerCase().includes(F) || T.category.toLowerCase().includes(F);
  }), A = async (T) => {
    g(!0);
    try {
      const F = await pe("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: T.name,
          description: T.description,
          skill_names: T.recommended_skills
        })
      });
      await At(
        F.id,
        "AGENTS.md",
        T.system_prompt
      ), T.profile_prompt && (await At(
        F.id,
        "PROFILE.md",
        T.profile_prompt
      ), await At(
        F.id,
        "BOOTSTRAP.md",
        `# 初始化已完成

此专家已按 UGSci 模板设置身份、风格与领域技能。直接执行 AGENTS.md 的领域工作流程，无需再次询问称呼、风格或初始化设置。
`
      ));
      const G = await Sr(F.id);
      G.approval_level = T.approval_level, await pe(`/agents/${encodeURIComponent(F.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(G)
      }), await Ea(F.id), u.success(`专家「${T.name}」创建成功`), t(), n();
    } catch (F) {
      u.error(F.message || "创建专家失败");
    } finally {
      g(!1);
    }
  };
  return r.createElement(
    r.Fragment,
    null,
    r.createElement(
      a,
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
          value: f,
          onChange: (T) => x(T.target.value),
          allowClear: !0
        })
      ),
      y ? r.createElement(
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
        f.trim() ? null : r.createElement(
          c,
          { xs: 24, sm: 12 },
          r.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => k(!0),
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
                h ? r.createElement(h) : "📝"
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(
                  E,
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
        ...z.map(
          (T) => r.createElement(
            c,
            { key: T.id, xs: 24, sm: 12 },
            r.createElement(
              s,
              {
                hoverable: !0,
                size: "small",
                onClick: () => A(T),
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
                r.createElement(it, {
                  name: T.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    E,
                    { strong: !0, style: { fontSize: 15 } },
                    T.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      l,
                      { color: "blue", style: { fontSize: 10 } },
                      T.category
                    ),
                    T.approval_level === "MANUAL" ? r.createElement(
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
                xr(T.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(Uo, {
      open: v,
      onCancel: () => k(!1),
      onCreate: M
    })
  );
}
function Gt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function No(e) {
  const t = e.trim();
  if (!t) return [];
  const n = JSON.parse(t);
  if (!Gt(n))
    throw new Error("MCP 配置必须是 JSON 对象");
  const r = n.mcpServers ?? n;
  if (!Gt(r))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(r).map(([i, a]) => {
    const s = i.trim();
    if (!s || !Gt(a))
      throw new Error(`MCP「${i || "未命名"}」配置无效`);
    const l = typeof a.url == "string" ? a.url : "", o = typeof a.command == "string" ? a.command : "";
    if (!l && !o)
      throw new Error(`MCP「${s}」需要配置 url 或 command`);
    const c = (typeof a.transport == "string" ? a.transport : typeof a.type == "string" ? a.type : "") === "sse" ? "sse" : l ? "streamable_http" : "stdio";
    return {
      clientKey: s,
      client: {
        name: typeof a.name == "string" ? a.name : s,
        description: typeof a.description == "string" ? a.description : "",
        enabled: typeof a.enabled == "boolean" ? a.enabled : !0,
        transport: c,
        url: l,
        command: o,
        args: Array.isArray(a.args) ? a.args : [],
        env: Gt(a.env) ? a.env : {},
        cwd: typeof a.cwd == "string" ? a.cwd : "",
        headers: Gt(a.headers) ? a.headers : {}
      }
    };
  });
}
function Uo({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = P().React, { useState: i, useEffect: a, useMemo: s } = r, {
    Modal: l,
    Input: o,
    Select: d,
    Button: c,
    Row: m,
    Col: u,
    Spin: p,
    Tag: E,
    Typography: h,
    message: y
  } = P().antd, { CheckCircleOutlined: g } = P().antdIcons || {}, { Text: f } = h, [x, v] = i(""), [k, M] = i(""), [z, A] = i(""), [T, F] = i(""), [G, _] = i([]), [$, I] = i([]), [R, S] = i(!1), [j, q] = i(""), [L, N] = i(!1);
  a(() => {
    e && (v(""), M(""), A(""), F(""), I([]), q(""), N(!1), S(!0), Nn(!0).then(_).catch((ue) => {
      _([]), y.error(ue.message || "加载技能池失败");
    }).finally(() => S(!1)));
  }, [e]);
  const J = k.trim(), B = s(() => J ? J.length < 2 || J.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(J) ? J === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [J]), O = s(() => {
    try {
      return { clients: No(j), error: "" };
    } catch (ue) {
      return {
        clients: [],
        error: ue.message || "MCP 配置无效"
      };
    }
  }, [j]), K = () => {
    const ue = x.trim();
    if (!ue) {
      y.warning("请输入专家名称");
      return;
    }
    if (B) {
      y.warning(B);
      return;
    }
    if (O.error) {
      y.warning(O.error);
      return;
    }
    N(!0), Promise.resolve(
      n({
        id: J,
        name: ue,
        description: z.trim(),
        systemPrompt: T,
        skillNames: $,
        mcpClients: O.clients
      })
    ).finally(() => N(!1));
  }, U = () => {
    I(
      G.filter((ue) => ue.source === "builtin").map((ue) => ue.name)
    );
  }, ie = (ue, le) => r.createElement(
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
      f,
      { strong: !0, style: { fontSize: 15 } },
      ue
    ),
    le ? r.createElement(
      f,
      { type: "secondary", style: { fontSize: 12 } },
      le
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
      okButtonProps: { loading: L },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    r.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      ie("基本信息", "ID 留空时自动生成"),
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
            value: x,
            onChange: (ue) => v(ue.target.value),
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
            value: k,
            onChange: (ue) => M(ue.target.value),
            maxLength: 64,
            status: B ? "error" : void 0
          }),
          B ? r.createElement(
            "div",
            { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } },
            B
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
            value: z,
            onChange: (ue) => A(ue.target.value),
            rows: 2,
            maxLength: 200,
            showCount: !0
          })
        )
      )
    ),
    r.createElement(
      "div",
      { style: { borderTop: "1px solid var(--app-border)", padding: "20px 0" } },
      ie("角色指令", "保存为 AGENTS.md"),
      r.createElement(o.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: T,
        onChange: (ue) => F(ue.target.value),
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
      ie("初始能力"),
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
            r.createElement(f, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(
                c,
                {
                  size: "small",
                  onClick: U,
                  disabled: R
                },
                "内置"
              ),
              r.createElement(
                c,
                {
                  size: "small",
                  onClick: () => I([]),
                  disabled: $.length === 0
                },
                "清空"
              )
            )
          ),
          R ? r.createElement(
            "div",
            { style: { textAlign: "center", padding: 32 } },
            r.createElement(p, { size: "small" })
          ) : r.createElement(d, {
            mode: "multiple",
            value: $,
            onChange: I,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: G.map((ue) => ({
              value: ue.name,
              label: ue.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            $.length > 0 ? r.createElement(
              E,
              { color: "blue" },
              `已选择 ${$.length} 个技能`
            ) : r.createElement(
              f,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加技能"
            )
          )
        ),
        r.createElement(
          u,
          { xs: 24, md: 12 },
          r.createElement(
            f,
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
            value: j,
            onChange: (ue) => q(ue.target.value),
            rows: 8,
            status: O.error ? "error" : void 0,
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12
            }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            O.error ? r.createElement(
              f,
              { type: "danger", style: { fontSize: 12 } },
              O.error
            ) : O.clients.length > 0 ? r.createElement(
              E,
              {
                color: "green",
                icon: g ? r.createElement(g) : void 0
              },
              `已识别 ${O.clients.length} 个 MCP`
            ) : r.createElement(
              f,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加 MCP"
            )
          )
        )
      )
    )
  );
}
const _i = "ugsci_custom_teams";
function Do(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function Fo() {
  try {
    const e = JSON.parse(
      localStorage.getItem(_i) || "[]"
    );
    return Array.isArray(e) ? e.filter(Do) : [];
  } catch {
    return [];
  }
}
function Go(e) {
  try {
    localStorage.setItem(_i, JSON.stringify(e));
  } catch {
  }
}
function Wo(e) {
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
function qo(e) {
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
async function ir(e = !0) {
  const t = await ct("/ugsci/team/custom");
  if (!t.ok) {
    const i = await t.text().catch(() => "");
    throw new Error(i || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(qo);
  return e && Go(r), r;
}
async function Ci(e) {
  const t = await ct("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Wo(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function Ho(e) {
  const t = await ct(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function Jo() {
  const e = Fo();
  if (e.length === 0) return;
  const t = await ir(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => Ci(r))
  );
}
async function Vo(e) {
  var i, a;
  const t = (i = e.body) == null ? void 0 : i.getReader();
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
            const p = u.error, E = typeof p == "string" ? p : (p == null ? void 0 : p.message) || "工作流启动失败";
            throw new Error(E);
          }
          if (u.object === "response" || u.type === "response") {
            const p = u.status;
            if (p === "failed" || p === "error") {
              const E = ((a = u.error) == null ? void 0 : a.message) || "工作流启动失败";
              throw new Error(E);
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
async function Ko(e, t, n) {
  const r = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, i = await ct("/chats", {
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
  if (!i.ok) {
    const o = await i.text().catch(() => "");
    throw new Error(o || `创建会话失败 (HTTP ${i.status})`);
  }
  const s = (await i.json()).id, l = await ct("/console/chat", {
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
  return await Vo(l), s;
}
function Ti(e, t) {
  var i;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (a) => a.name === t || a.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((i = e.find(
    (a) => a.name.includes(t) || t.includes(a.name) || a.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : i.id) || null;
}
function Ii() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function $i(e, t) {
  const n = await e.text().catch(() => "");
  if (!n) return t;
  try {
    const r = JSON.parse(n);
    if (typeof r.detail == "string") return r.detail;
  } catch {
  }
  return n;
}
async function $r(e, t, n) {
  const r = await ct(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await $i(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function Xo(e, t) {
  return $r("/ugsci/team/state", e, t);
}
async function Yo(e, t) {
  const n = await ct("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await $i(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const Qo = 5e3;
function ba({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = Ii(), r = n.React, { useCallback: i, useEffect: a, useRef: s, useState: l } = r, { Alert: o, Button: d, Card: c, Empty: m, Spin: u, Tag: p, Typography: E } = n.antd, { Text: h, Paragraph: y } = E, g = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, f = (g == null ? void 0 : g.id) || "default", [x, v] = l([]), [k, M] = l(!0), [z, A] = l(null), [T, F] = l(!1), G = s(null), _ = s(0), $ = s(!1), I = s(f), R = i(
    async (q = !0, L = !0) => {
      var B;
      if (!t || !L && $.current) return;
      (B = G.current) == null || B.abort();
      const N = new AbortController();
      G.current = N;
      const J = ++_.current;
      $.current = !0, q && M(!0);
      try {
        const O = await Yo(f, N.signal);
        if (N.signal.aborted || J !== _.current)
          return;
        v(O), F(!0), A(null);
      } catch (O) {
        if (N.signal.aborted || J !== _.current)
          return;
        A(
          O instanceof Error ? O.message : "讨论运行记录加载失败"
        );
      } finally {
        !N.signal.aborted && J === _.current && (G.current = null, $.current = !1, M(!1));
      }
    },
    [f, t]
  );
  if (a(() => {
    var L;
    if (!t) {
      (L = G.current) == null || L.abort(), G.current = null, $.current = !1, _.current += 1;
      return;
    }
    I.current !== f && (I.current = f, v([]), A(null), F(!1)), R(!0, !0);
    const q = e ? window.setInterval(() => {
      R(!1, !1);
    }, Qo) : null;
    return () => {
      var N;
      q !== null && window.clearInterval(q), (N = G.current) == null || N.abort(), G.current = null, $.current = !1, _.current += 1;
    };
  }, [e, f, t, R]), k && !T) return r.createElement(u);
  if (z && !T)
    return r.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: z,
      action: r.createElement(
        d,
        { size: "small", onClick: () => void R(!0, !0), loading: k },
        "重试"
      )
    });
  const S = x.filter(
    (q) => e ? q.status === "active" : q.status !== "active"
  ), j = (q) => z ? r.createElement(
    r.Fragment,
    null,
    r.createElement(o, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: z,
      action: r.createElement(
        d,
        {
          size: "small",
          onClick: () => void R(!0, !0),
          loading: k
        },
        "重试"
      )
    }),
    q
  ) : q;
  return S.length === 0 ? j(
    r.createElement(
      m,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        d,
        { size: "small", onClick: () => void R(!0, !0), loading: k },
        "刷新"
      )
    )
  ) : j(
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
          { size: "small", onClick: () => void R(!0, !0), loading: k },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...S.map(
          (q) => r.createElement(
            c,
            { key: q.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                h,
                { strong: !0 },
                q.team_name || q.team_id
              ),
              r.createElement(
                p,
                {
                  color: q.status === "completed" ? "green" : q.status === "terminated" ? "orange" : "blue"
                },
                q.status
              ),
              r.createElement(p, null, q.current_phase),
              r.createElement(
                h,
                { type: "secondary" },
                `迭代 ${q.iteration}`
              )
            ),
            r.createElement(
              y,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              q.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function Zo() {
  try {
    return (await $r(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function el() {
  try {
    return (await $r(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const tl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, va = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], wa = 5e3, nl = 3e4;
function rl({ enabled: e = !0 }) {
  const t = Ii(), n = t.React, { useState: r, useEffect: i, useCallback: a, useRef: s } = n, { Card: l, Tag: o, Typography: d, Button: c, Steps: m, Empty: u, Alert: p, Spin: E } = t.antd, { ReloadOutlined: h } = t.antdIcons || {}, { Text: y, Paragraph: g } = d, f = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, x = (f == null ? void 0 : f.id) || "default", [v, k] = r(null), [M, z] = r(!1), [A, T] = r(null), F = s(null), G = s(0), _ = s(0), $ = s(0), I = s(null), R = s(!1), S = a(
    async (le, ae = !0) => {
      var ee;
      if (!e || !ae && R.current) return;
      (ee = I.current) == null || ee.abort();
      const Q = new AbortController();
      I.current = Q;
      const W = ++$.current;
      R.current = !0, le && z(!0);
      try {
        const X = await Xo(x, Q.signal);
        if (Q.signal.aborted || W !== $.current)
          return;
        G.current = 0, _.current = 0, F.current = X, k(X), T(null);
      } catch (X) {
        if (Q.signal.aborted || W !== $.current)
          return;
        G.current += 1;
        const D = Math.min(
          nl,
          wa * 2 ** (G.current - 1)
        );
        _.current = Date.now() + D, T(
          X instanceof Error ? X.message : "专家团状态加载失败"
        );
      } finally {
        !Q.signal.aborted && W === $.current && (I.current = null, R.current = !1, z(!1));
      }
    },
    [x, e]
  ), j = a(() => (G.current = 0, _.current = 0, S(!0)), [S]);
  if (i(() => {
    var ae;
    if ((ae = I.current) == null || ae.abort(), I.current = null, R.current = !1, $.current += 1, G.current = 0, _.current = 0, F.current = null, k(null), T(null), !e) return;
    j();
    const le = window.setInterval(() => {
      var Q, W;
      Date.now() < _.current || ((Q = F.current) == null ? void 0 : Q.status) === "completed" || ((W = F.current) == null ? void 0 : W.status) === "terminated" || S(!1, !1);
    }, wa);
    return () => {
      var Q;
      window.clearInterval(le), (Q = I.current) == null || Q.abort(), I.current = null, R.current = !1, $.current += 1;
    };
  }, [x, e, S, j]), M && !v && !A)
    return n.createElement(E);
  if (A && !v)
    return n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: A,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: j, loading: M },
        "重试"
      )
    });
  const q = (le) => A ? n.createElement(
    n.Fragment,
    null,
    n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: A,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: j, loading: M },
        "重试"
      )
    }),
    le
  ) : le;
  if ((v == null ? void 0 : v.status) === "unreadable")
    return q(
      n.createElement(p, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${v.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          c,
          { size: "small", onClick: j, loading: M },
          "重试"
        )
      })
    );
  if (!v || !v.active) {
    if ((v == null ? void 0 : v.status) === "completed" || (v == null ? void 0 : v.status) === "terminated") {
      const le = v.status === "completed";
      return q(
        n.createElement(p, {
          type: le ? "success" : "info",
          showIcon: !0,
          message: le ? "专家团工作流已完成" : "专家团工作流已终止",
          description: le ? `实例 ${v.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${v.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return q(
      n.createElement(u, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const L = v.state, N = L.current_phase || "plan", J = va.indexOf(N), B = L.team_name || "未知团队", O = L.team_mode || "pipeline", K = L.iteration || 0, U = L.members || [], ie = L.verify_retries || 0, ue = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return q(
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
            y,
            { strong: !0 },
            `${B} — 工作流状态`
          ),
          n.createElement(
            o,
            { color: "blue", style: { fontSize: 10 } },
            ue[O] || O
          ),
          n.createElement(
            o,
            { style: { fontSize: 10 } },
            `迭代 ${K}`
          ),
          ie > 0 ? n.createElement(
            o,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${ie}`
          ) : null
        ),
        extra: n.createElement(
          c,
          {
            size: "small",
            type: "text",
            icon: h ? n.createElement(h) : void 0,
            onClick: j,
            loading: M
          },
          "刷新"
        )
      },
      n.createElement(m, {
        current: J,
        size: "small",
        items: va.map((le) => {
          const ae = tl[le];
          return {
            title: `${ae.icon} ${ae.label}`,
            description: le === "plan" ? "分析任务，创建任务分解" : le === "dispatch" ? "分派专家执行任务" : le === "verify" ? "交叉验证专家结果" : le === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
        ...U.map(
          (le, ae) => n.createElement(
            o,
            { key: `${le.name}-${ae}`, style: { fontSize: 11 } },
            `${le.emoji || ""} ${le.name}（${le.role}）`
          )
        )
      ),
      L.task ? n.createElement(
        g,
        {
          style: {
            fontSize: 12,
            marginTop: 8,
            marginBottom: 0,
            color: "var(--ant-color-text-secondary, #666)"
          },
          ellipsis: { rows: 2 }
        },
        `任务: ${L.task}`
      ) : null
    )
  );
}
function al({ team: e }) {
  const t = P().React, { Typography: n, Tag: r } = P().antd, { Text: i } = n, a = {
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
      i,
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
          a[e.mode]
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
          t.createElement(it, {
            name: c.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              i,
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
          a[e.mode]
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
          t.createElement(it, {
            name: c.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              i,
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
function yn(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const il = [
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
function sl({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: i
}) {
  const a = P().React, { useState: s, useEffect: l, useCallback: o } = a, {
    Modal: d,
    Input: c,
    Button: m,
    Select: u,
    Tag: p,
    Typography: E,
    Switch: h,
    Empty: y,
    message: g,
    Divider: f,
    Steps: x
  } = P().antd, { PlusOutlined: v, DeleteOutlined: k, SaveOutlined: M, ArrowRightOutlined: z } = P().antdIcons || {}, { Text: A, Paragraph: T } = E, [F, G] = s(""), [_, $] = s("🤝"), [I, R] = s(""), [S, j] = s("pipeline"), [q, L] = s(""), [N, J] = s(""), [B, O] = s([]), [K, U] = s([]), [ie, ue] = s(!1), [le, ae] = s(2), [Q, W] = s(""), [ee, X] = s(""), [D, me] = s({}), [ve, de] = s(
    {}
  ), [Y, be] = s(
    il
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
    e && (r ? (G(r.name), $(r.emoji), R(r.description), j(r.mode), L(r.coordinatorName || ""), J(r.taskTemplate), O(r.steps || []), U(r.members.map((b) => b.name)), ae(r.maxReviewRounds || 2), W(r.successCriteria || ""), X(r.routingInstruction || ""), me(
      Object.fromEntries(
        r.members.map((b) => [
          b.name,
          b.bindingMode || (b.agentId ? "fixed" : "preferred")
        ])
      )
    ), de(
      Object.fromEntries(
        r.members.map((b) => [
          b.name,
          b.roleKey || yn(b.name)
        ])
      )
    )) : (G(""), $("🤝"), R(""), j("pipeline"), L(""), J(`请执行以下任务：
任务描述：{任务描述}`), O([]), U([]), ae(2), W(""), X(""), me({}), de({})));
  }, [e, r]), l(() => {
    e && el().then((b) => {
      b != null && b.length && be(b);
    });
  }, [e]);
  const Ae = o(() => {
    if (S === "roundtable" || S === "debate" || S === "router") {
      const b = K.map((V) => ({
        agentName: V,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      O(b);
    } else if (S === "pipeline") {
      const b = new Map(B.map((C) => [C.agentName, C])), V = K.map((C) => b.get(C) || {
        agentName: C,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      O(V);
    }
  }, [S, K, B]), Re = (b) => {
    K.includes(b) || (U([...K, b]), me({ ...D, [b]: "fixed" }), de({
      ...ve,
      [b]: yn(b)
    }), (S === "coordinator" || S === "debate") && !q && L(b));
  }, Se = (b) => {
    const V = K.filter((ge) => ge !== b);
    U(V), O(B.filter((ge) => ge.agentName !== b));
    const C = { ...D };
    delete C[b], me(C);
    const re = { ...ve };
    delete re[b], de(re), q === b && L(V[0] || "");
  }, fe = (b, V, C) => {
    const re = [...B];
    re[b] = { ...re[b], [V]: C }, O(re);
  }, ye = async () => {
    if (!F.trim()) {
      g.warning("请输入团队名称");
      return;
    }
    if (K.length < 2) {
      g.warning("至少需要选择 2 个成员");
      return;
    }
    if (!N.trim()) {
      g.warning("请输入任务模板");
      return;
    }
    if ((S === "coordinator" || S === "debate") && !q) {
      g.warning(S === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    ue(!0);
    try {
      let b = [...K];
      S === "coordinator" && q ? b = [
        q,
        ...b.filter((ge) => ge !== q)
      ] : S === "debate" && q && (b = [
        ...b.filter((ge) => ge !== q),
        q
      ]);
      const V = b.map((ge) => {
        var Ge;
        const Z = n.find((qe) => qe.name === ge), he = D[ge] || "fixed", xe = ve[ge] || yn(ge), Ie = Y.find((qe) => qe.key === xe);
        return {
          name: ge,
          role: (Ie == null ? void 0 : Ie.display_name) || ((Ge = Z == null ? void 0 : Z.description) == null ? void 0 : Ge.slice(0, 30)) || "需求分析师",
          emoji: "",
          agentId: he === "temporary" || Z == null ? void 0 : Z.id,
          roleKey: xe,
          bindingMode: he
        };
      });
      let C = B;
      (B.length === 0 || B.length !== K.length) && (C = K.map((ge) => ({
        agentName: ge,
        instruction: "请完成你的专业部分",
        passContext: S === "pipeline"
      })));
      const re = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: F.trim(),
        emoji: _,
        category: "自定义",
        description: I.trim() || `${F.trim()}（${K.length}人团队）`,
        mode: S,
        members: V,
        coordinatorName: S === "coordinator" || S === "debate" ? q : void 0,
        taskTemplate: N.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: C,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: le,
        successCriteria: Q.trim(),
        routingInstruction: ee.trim()
      };
      await Ci(re), g.success(r ? "团队已更新" : "团队已创建"), i(), t();
    } catch (b) {
      g.error(b.message || "保存失败");
    } finally {
      ue(!1);
    }
  }, we = n.filter(
    (b) => !K.includes(b.name)
  );
  return a.createElement(
    d,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(
          "span",
          { style: { fontSize: 20 } },
          r ? "✏️" : "➕"
        ),
        a.createElement(
          "span",
          null,
          r ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 860,
      onOk: ye,
      okText: "保存专家团",
      confirmLoading: ie,
      okButtonProps: {
        icon: M ? a.createElement(M) : void 0
      }
    },
    // Step 1: Basic info
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            marginBottom: 8,
            alignItems: "center"
          }
        },
        K.length > 0 ? a.createElement(Ir, {
          members: K,
          size: 36
        }) : null,
        a.createElement(c, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: F,
          onChange: (b) => G(b.target.value),
          style: { flex: 1 }
        })
      ),
      a.createElement(c.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: I,
        onChange: (b) => R(b.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      a.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", margin: "12px 0 8px", fontSize: 13 }
        },
        "选择协同模式"
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8
          }
        },
        ...ke.map((b) => {
          const V = S === b.value;
          return a.createElement(
            "button",
            {
              key: b.value,
              type: "button",
              onClick: () => {
                j(b.value), b.value !== "coordinator" && b.value !== "debate" && L("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: V ? `${b.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${V ? b.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: V ? `0 0 0 2px ${b.accent}1a` : "none"
              }
            },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: b.accent,
                  fontWeight: 600
                }
              },
              a.createElement(
                "span",
                { style: { fontSize: 18 } },
                b.icon
              ),
              b.title
            ),
            a.createElement(
              "div",
              {
                style: {
                  fontSize: 11,
                  color: "#595959",
                  marginTop: 5,
                  lineHeight: 1.45
                }
              },
              b.description
            ),
            a.createElement(
              "div",
              {
                style: {
                  fontSize: 10,
                  color: b.accent,
                  marginTop: 5,
                  fontFamily: "monospace"
                }
              },
              b.topology
            )
          );
        })
      )
    ),
    a.createElement(f, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      we.length > 0 ? a.createElement(
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
        ...we.map(
          (b) => a.createElement(
            m,
            {
              key: b.id,
              size: "small",
              icon: v ? a.createElement(v) : void 0,
              onClick: () => Re(b.name)
            },
            b.name
          )
        )
      ) : null,
      // Selected members
      K.length === 0 ? a.createElement(y, {
        description: "请从上方添加团队成员",
        image: y.PRESENTED_IMAGE_SIMPLE
      }) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...K.map(
          (b) => a.createElement(
            "div",
            {
              key: b,
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
            a.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              a.createElement(it, {
                name: b,
                size: 24
              }),
              a.createElement(
                A,
                { strong: !0, style: { fontSize: 13 } },
                b
              ),
              (S === "coordinator" || S === "debate") && q === b ? a.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                S === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            a.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              a.createElement(u, {
                size: "small",
                value: ve[b] || yn(b),
                style: { width: 132 },
                onChange: (V) => de({
                  ...ve,
                  [b]: V
                }),
                options: Y.map((V) => ({
                  value: V.key,
                  label: V.display_name
                }))
              }),
              a.createElement(u, {
                size: "small",
                value: D[b] || "fixed",
                style: { width: 118 },
                onChange: (V) => me({
                  ...D,
                  [b]: V
                }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              S === "coordinator" || S === "debate" ? a.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  onClick: () => L(b)
                },
                S === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              a.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: k ? a.createElement(k) : void 0,
                  onClick: () => Se(b)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    S === "review_loop" || S === "router" ? a.createElement(
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
      S === "review_loop" ? a.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: 10
          }
        },
        a.createElement(u, {
          value: le,
          onChange: (b) => ae(b),
          options: [1, 2, 3, 4, 5].map((b) => ({
            value: b,
            label: `最多 ${b} 轮`
          }))
        }),
        a.createElement(c, {
          value: Q,
          onChange: (b) => W(b.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : a.createElement(c, {
        value: ee,
        onChange: (b) => X(b.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    a.createElement(f, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    K.length > 0 ? a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${S === "roundtable" ? "（并行独立）" : S === "pipeline" ? "（顺序交接）" : S === "router" ? "（作为候选能力）" : S === "review_loop" ? "（首位执行、末位评审）" : S === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      a.createElement(
        m,
        {
          size: "small",
          type: "dashed",
          onClick: Ae,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      B.length === 0 ? a.createElement(
        A,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...B.map(
          (b, V) => a.createElement(
            "div",
            {
              key: V,
              style: {
                padding: 8,
                background: "var(--ant-color-bg-container, #fff)",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              S === "pipeline" ? a.createElement(
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
                `${V + 1}`
              ) : a.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              a.createElement(
                p,
                { color: "blue", style: { fontSize: 11 } },
                b.agentName
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(c, {
                  placeholder: "请输入该步骤的指令...",
                  value: b.instruction,
                  onChange: (C) => fe(V, "instruction", C.target.value),
                  size: "small"
                })
              )
            ),
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              a.createElement(h, {
                size: "small",
                checked: b.passContext,
                onChange: (C) => fe(V, "passContext", C)
              }),
              a.createElement(
                A,
                { type: "secondary", style: { fontSize: 11 } },
                b.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    a.createElement(f, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    a.createElement(
      "div",
      null,
      a.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${K.length > 0 ? "4" : "3"}. 任务模板`
      ),
      a.createElement(c.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: N,
        onChange: (b) => J(b.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      a.createElement(
        A,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function xa({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: i
}) {
  var $;
  const a = P().React, { useState: s } = a, { Card: l, Tag: o, Typography: d, Button: c, Tooltip: m, Popconfirm: u } = P().antd, {
    TeamOutlined: p,
    RocketOutlined: E,
    UserOutlined: h,
    EditOutlined: y,
    DeleteOutlined: g,
    DownOutlined: f,
    UpOutlined: x
  } = P().antdIcons || {}, { Text: v, Paragraph: k } = d, [M, z] = s(!1), A = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, T = A[e.mode] || A.coordinator, F = e.members.map((I) => {
    const R = I.bindingMode === "temporary", S = R ? null : (I.agentId && t.some((j) => j.id === I.agentId) ? I.agentId : null) || Ti(t, I.name);
    return { ...I, found: !!S, agentId: S, temporary: R };
  }), G = F.filter((I) => I.found).length, _ = e.coordinatorName || (($ = e.members[0]) == null ? void 0 : $.name);
  return a.createElement(
    l,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      a.createElement(Ir, {
        members: e.members.map((I) => I.name),
        size: 36
      }),
      a.createElement(
        "div",
        { style: { flex: 1 } },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          a.createElement(
            v,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? a.createElement(
            o,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        a.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          a.createElement(
            o,
            { color: T.color, style: { fontSize: 10 } },
            T.label
          ),
          a.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          G < e.members.length ? a.createElement(
            m,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            a.createElement(
              o,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : a.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? a.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        r ? a.createElement(
          m,
          { title: "编辑" },
          a.createElement(c, {
            type: "text",
            size: "small",
            icon: y ? a.createElement(y) : void 0,
            onClick: (I) => {
              I.stopPropagation(), r(e);
            }
          })
        ) : null,
        i ? a.createElement(
          m,
          { title: "删除" },
          a.createElement(
            u,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => i(e)
            },
            a.createElement(c, {
              type: "text",
              size: "small",
              danger: !0,
              icon: g ? a.createElement(g) : void 0,
              onClick: (I) => I.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    a.createElement(
      k,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...F.map(
        (I) => a.createElement(
          m,
          {
            key: I.name,
            title: `${I.name}（${I.role}）${I.temporary ? " - OMP 临时派生" : I.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
          },
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: I.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${I.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            a.createElement(it, { name: I.name, size: 18 }),
            a.createElement(
              v,
              {
                style: { fontSize: 11, color: I.found ? "#1f4e8c" : "#531dab" }
              },
              I.name
            ),
            I.temporary ? a.createElement(
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
    a.createElement(
      c,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (I) => {
          I.stopPropagation(), z(!M);
        },
        icon: M ? x ? a.createElement(x) : "▲" : f ? a.createElement(f) : "▼"
      },
      M ? "收起流程" : "查看执行流程"
    ),
    M ? a.createElement(al, { team: e }) : null,
    // Footer: launch button
    a.createElement(
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
      a.createElement(
        v,
        { type: "secondary", style: { fontSize: 11 } },
        _ ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${_}` : "OMP 动态编排"
      ),
      a.createElement(
        c,
        {
          type: "primary",
          size: "small",
          icon: E ? a.createElement(E) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: nt
        },
        "运行工作流"
      )
    )
  );
}
function ol({
  agents: e,
  onLaunch: t
}) {
  const n = P().React, { useMemo: r, useState: i, useCallback: a, useEffect: s } = n, {
    Row: l,
    Col: o,
    Input: d,
    Empty: c,
    Typography: m,
    Tag: u,
    Button: p,
    Divider: E,
    Tabs: h,
    message: y
  } = P().antd, { SearchOutlined: g, PlusOutlined: f, RocketOutlined: x } = P().antdIcons || {}, { Text: v } = m, [k, M] = i(""), [z, A] = i([]), [T, F] = i([]), [G, _] = i(!1), [$, I] = i(null), [R, S] = i("preset");
  s(() => {
    let U = !0;
    return (async () => {
      try {
        await Jo();
        const ie = await ir();
        U && A(ie);
      } catch (ie) {
        console.warn("[ugsci] Failed to load backend expert teams:", ie), U && (A([]), y.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), Zo().then((ie) => {
      U && ie && F(ie);
    }), () => {
      U = !1;
    };
  }, []);
  const j = a(() => {
    ir().then(A).catch((U) => {
      console.warn("[ugsci] Failed to refresh expert teams:", U), A([]), y.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [y]), q = a(
    (U) => {
      Ho(U.id).then(() => {
        j(), y.success(`团队「${U.name}」已删除`);
      }).catch((ie) => y.error(ie.message || "删除专家团失败"));
    },
    [y, j]
  ), L = a((U) => {
    I(U), _(!0);
  }, []), N = a(() => {
    I(null), _(!0);
  }, []), J = r(() => [...z, ...T], [z, T]), B = r(() => {
    if (!k.trim()) return J;
    const U = k.toLowerCase();
    return J.filter(
      (ie) => ie.name.toLowerCase().includes(U) || ie.description.toLowerCase().includes(U) || ie.category.toLowerCase().includes(U)
    );
  }, [J, k]), O = B.filter((U) => U.custom), K = B.filter((U) => !U.custom);
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
        prefix: g ? n.createElement(g) : void 0,
        value: k,
        onChange: (U) => M(U.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: f ? n.createElement(f) : void 0,
          onClick: N,
          style: nt
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(h, {
      activeKey: R,
      onChange: S,
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
                (U) => n.createElement(
                  o,
                  { key: U.id, xs: 24, sm: 12, md: 8 },
                  n.createElement(xa, {
                    team: U,
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
          label: `自定义团队${O.length ? ` (${O.length})` : ""}`,
          children: n.createElement(
            "div",
            null,
            O.length > 0 ? n.createElement(
              l,
              { gutter: [12, 12] },
              ...O.map(
                (U) => n.createElement(
                  o,
                  { key: U.id, xs: 24, sm: 12, md: 8 },
                  n.createElement(xa, {
                    team: U,
                    agents: e,
                    onLaunch: t,
                    onEdit: L,
                    onDelete: q
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
            n.createElement(rl, {
              enabled: R === "active"
            }),
            n.createElement(ba, {
              activeOnly: !0,
              enabled: R === "active"
            })
          )
        },
        {
          key: "history",
          label: "讨论历史",
          children: n.createElement(ba, {
            enabled: R === "history"
          })
        }
      ]
    }),
    // Team Builder Modal
    n.createElement(sl, {
      open: G,
      onClose: () => {
        _(!1), I(null);
      },
      agents: e,
      editingTeam: $,
      onSaved: j
    })
  );
}
const ll = [
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
], cl = 5e3, Xn = {
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
function dl(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Wt(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), dl(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function ul(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function ml(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function pl(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const n = Object.values(e).filter(
    (i) => i === "success" || i === "completed" || i === "skipped" || i === "cached"
  ).length, r = Object.values(e).filter(
    (i) => i === "error" || i === "failed"
  ).length;
  return r > 0 ? `${n}/${t} 节点完成 (${r} 失败)` : `${n}/${t} 节点完成`;
}
function Ai(e) {
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
function qt(e) {
  return ["success", "completed", "skipped", "cached"].includes(e) ? "green" : ["error", "failed"].includes(e) ? "red" : ["running"].includes(e) ? "blue" : ["queued", "pending"].includes(e) ? "cyan" : "gold";
}
function gl(e, t) {
  const n = typeof e.type == "string" ? e.type : "事件", r = typeof e.node_id == "string" ? ` · ${e.node_id}` : "", i = e.state && typeof e.state == "object" ? e.state : {}, a = e.data && typeof e.data == "object" ? e.data : {}, s = [e.message, i.message, i.error, a.message, a.error].find(
    (d) => typeof d == "string" && d.length > 0
  ) || "";
  if (s) return `${n}${r}: ${s}`;
  const l = typeof e.status == "string" ? e.status : typeof i.status == "string" ? i.status : "", o = l ? ` · ${Ai(l)}` : "";
  if (o) return `${n}${r}${o}`;
  try {
    const d = JSON.stringify(Object.keys(a).length > 0 ? a : e) || "{}", c = d.length > 240 ? `${d.slice(0, 237)}...` : d;
    return `${n}${r}: ${c}`;
  } catch {
    return `${n}${r} #${t + 1}`;
  }
}
const fl = /* @__PURE__ */ new Set([
  "running",
  "queued",
  "paused",
  "waiting_human"
]);
function hn(e) {
  return !e.resumed_by_run_id && fl.has(e.status);
}
function yl() {
  const e = P().React, { useCallback: t, useEffect: n, useRef: r, useState: i } = e, {
    Alert: a,
    Button: s,
    Card: l,
    Col: o,
    Empty: d,
    Input: c,
    Popconfirm: m,
    Modal: u,
    Row: p,
    Space: E,
    Spin: h,
    Tabs: y,
    Progress: g,
    Tag: f,
    Tooltip: x,
    Typography: v,
    message: k
  } = P().antd, {
    ApartmentOutlined: M,
    DeleteOutlined: z,
    ReloadOutlined: A,
    RocketOutlined: T,
    PlayCircleOutlined: F,
    StopOutlined: G
  } = P().antdIcons || {}, { Text: _, Paragraph: $, Title: I } = v, R = P().useSelectedAgent, S = R ? R() : { id: "default" }, j = (S == null ? void 0 : S.id) || "default", [q, L] = i([]), [N, J] = i([]), [B, O] = i([]), [K, U] = i(!0), [ie, ue] = i(!0), [le, ae] = i(null), [Q, W] = i(null), [ee, X] = i(""), D = r(0), me = r(j);
  me.current = j;
  const [ve, de] = i(""), [Y, be] = i(""), [ke, Ae] = i("templates"), [Re, Se] = i(/* @__PURE__ */ new Set()), [fe, ye] = i(/* @__PURE__ */ new Set()), we = r(null), b = N.some(hn), V = e.useMemo(() => {
    const H = {};
    return q.forEach((Ee) => {
      H[Ee.id] = Ee.name;
    }), H;
  }, [q]), C = e.useMemo(() => {
    const H = {};
    return N.forEach((Ee) => {
      hn(Ee) && (H[Ee.flow_id] = (H[Ee.flow_id] || 0) + 1);
    }), H;
  }, [N]), re = t(async (H = !1) => {
    H || U(!0);
    try {
      const [Ee, Pe, Fe] = await Promise.all([
        pe("/flowforge/flows", { bypassCache: !0 }),
        pe("/flowforge/runs", { bypassCache: !0 }),
        pn().catch(() => [])
      ]);
      L(Ee), J(Pe), O(Fe), ue(!0);
    } catch (Ee) {
      console.warn("[ugsci] FlowForge is unavailable:", Ee), H || ue(!1);
    } finally {
      H || U(!1);
    }
  }, []);
  n(() => {
    re();
  }, [re]), n(() => {
    if (!ie || !b) {
      we.current && (clearInterval(we.current), we.current = null);
      return;
    }
    let H = !1;
    return we.current = setInterval(async () => {
      if (!H) {
        H = !0;
        try {
          await re(!0);
        } finally {
          H = !1;
        }
      }
    }, cl), () => {
      we.current && (clearInterval(we.current), we.current = null);
    };
  }, [b, ie, re]);
  const ge = t(
    async (H) => {
      if (!le) {
        ae(H.key);
        try {
          const Ee = await pe(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: H.sop,
                name: H.name,
                agent_id: j
              })
            }
          ), Pe = {
            ...Ee.nodes || {}
          }, Fe = Object.entries(Pe).filter(([Je]) => /^step_\d+$/.test(Je)).sort(
            ([Je], [$e]) => Number(Je.slice(5)) - Number($e.slice(5))
          ), ce = {};
          let Be = 0, Ne = 0;
          Fe.forEach(([Je, $e], dt) => {
            const ot = H.roleHints[dt] || "", De = H.roleKeys[dt] || "analyst", Oe = B.find(
              (jt) => `${jt.name} ${jt.id}`.toLowerCase().includes(ot.toLowerCase())
            );
            Oe ? Be++ : Ne++;
            const lt = (Oe == null ? void 0 : Oe.id) || j, wt = {
              ...$e.inputs || {}
            };
            wt.agent_id = lt, Pe[Je] = {
              ...$e,
              inputs: wt,
              metadata: {
                ...$e.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: ot,
                role_key: De,
                agent_id: lt
              }
            }, ce[Je] = {
              binding_policy: "fixed_instance",
              role_hint: ot,
              role_key: De,
              agent_id: lt
            };
          });
          const He = {
            ...Ee,
            nodes: Pe,
            id: `${H.key}-${Date.now()}`,
            name: H.name,
            description: H.description,
            metadata: {
              ...Ee.metadata || {},
              domain: "oil-gas",
              template_key: H.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: j,
              node_bindings: ce
            }
          };
          await pe("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(He)
          });
          const st = Fe.length > 0 ? `（${Be} 个专家已匹配，${Ne} 个回退到控制器）` : "";
          k.success(`已创建工作流草稿「${H.name}」${st}`), await re();
        } catch (Ee) {
          k.error(Ee.message || "创建工作流失败");
        } finally {
          ae(null);
        }
      }
    },
    [B, j, le, re, k]
  );
  n(() => {
    D.current++, W(null), X(""), ae(null);
  }, [j]);
  const Z = t(async () => {
    if (le || !Y.trim()) return;
    const H = ++D.current;
    ae("natural-language"), X("");
    try {
      const Ee = await pe(
        "/flowforge/authoring/proposals",
        {
          method: "POST",
          body: JSON.stringify({
            prompt: Y.trim(),
            name: ve.trim(),
            agent_id: j
          })
        }
      );
      H === D.current && W(Ee);
    } catch (Ee) {
      H === D.current && X(Ee.message || "生成失败，请检查模型配置后重试");
    } finally {
      H === D.current && ae(null);
    }
  }, [j, le, ve, Y]), he = t(async () => {
    if (!(Q != null && Q.validation.ok) || le) return;
    const H = j;
    ae("apply"), X("");
    try {
      const Ee = await pe(
        `/flowforge/authoring/proposals/${encodeURIComponent(
          Q.proposal_id
        )}/apply`,
        {
          method: "POST",
          body: JSON.stringify({ expected_revision: Q.base_revision })
        }
      );
      if (me.current !== H) return;
      W(null), de(""), be(""), k.success("方案已应用并保存"), Wt(Ee.id);
    } catch (Ee) {
      me.current === H && X(Ee.message || "应用失败，请重新生成方案");
    } finally {
      me.current === H && ae(null);
    }
  }, [Q, le, j, k]), xe = t(
    async (H, Ee) => {
      try {
        await pe(`/flowforge/flows/${encodeURIComponent(H)}`, {
          method: "DELETE"
        }), k.success(`已删除工作流「${Ee}」`), await re();
      } catch (Pe) {
        k.error(Pe.message || "删除工作流失败");
      }
    },
    [re, k]
  ), Ie = t(
    async (H) => {
      Se((Ee) => {
        const Pe = new Set(Ee);
        return Pe.add(H), Pe;
      });
      try {
        await pe(`/flowforge/runs/${encodeURIComponent(H)}/cancel`, {
          method: "POST"
        }), k.success("已请求取消运行"), await re(!0);
      } catch (Ee) {
        k.error(Ee.message || "取消运行失败");
      } finally {
        Se((Ee) => {
          const Pe = new Set(Ee);
          return Pe.delete(H), Pe;
        });
      }
    },
    [re, k]
  ), Ge = e.createElement(
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
        E,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(c, {
          "aria-label": "工作流名称",
          value: ve,
          onChange: (H) => de(H.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(c.TextArea, {
          "aria-label": "工作流需求描述",
          value: Y,
          onChange: (H) => be(H.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          s,
          {
            type: "primary",
            onClick: () => void Z(),
            loading: le === "natural-language",
            disabled: !ie || !!le || !Y.trim(),
            style: nt
          },
          "生成并预览方案"
        )
      )
    ),
    e.createElement(
      p,
      { gutter: [12, 12] },
      ...ll.map(
        (H) => e.createElement(
          o,
          { key: H.key, xs: 24, md: 8 },
          e.createElement(
            l,
            { style: { height: "100%" } },
            e.createElement(
              E,
              { align: "start", style: { width: "100%" } },
              e.createElement(
                "span",
                { style: { fontSize: 28 } },
                H.icon
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  I,
                  { level: 5, style: { margin: 0 } },
                  H.name
                ),
                e.createElement(
                  f,
                  { color: "blue", style: { marginTop: 6 } },
                  H.category
                ),
                e.createElement(
                  $,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  H.description
                ),
                e.createElement(
                  s,
                  {
                    type: "primary",
                    loading: le === H.key,
                    disabled: !ie || !!le,
                    onClick: () => void ge(H),
                    style: nt
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
          ([H, Ee, Pe]) => e.createElement(
            o,
            { key: H, xs: 24, sm: 12, lg: 6 },
            e.createElement(_, { strong: !0 }, H),
            e.createElement(
              f,
              {
                color: Pe === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              Pe
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
  ), qe = K ? e.createElement(h) : q.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    p,
    { gutter: [12, 12] },
    ...q.map((H) => {
      const Ee = C[H.id] || 0;
      return e.createElement(
        o,
        { key: H.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          l,
          {
            size: "small",
            title: e.createElement(
              E,
              { size: 6 },
              e.createElement("span", null, H.name),
              Ee > 0 ? e.createElement(
                f,
                { color: "blue" },
                `${Ee} 个运行中`
              ) : null
            ),
            extra: e.createElement(f, null, `v${H.version}`)
          },
          e.createElement(
            $,
            { ellipsis: { rows: 2 } },
            H.description || "暂无描述"
          ),
          e.createElement(
            E,
            { size: 8, wrap: !0 },
            e.createElement(
              f,
              { color: "geekblue" },
              `${H.node_count} 个节点`
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "primary",
                icon: F ? e.createElement(F) : void 0,
                disabled: !ie,
                onClick: () => Wt(H.id)
              },
              "配置并运行"
            ),
            e.createElement(
              s,
              {
                size: "small",
                onClick: () => Wt(H.id)
              },
              "编辑"
            ),
            e.createElement(
              m,
              {
                title: "确认删除",
                description: `确定要删除工作流「${H.name}」吗？此操作不可撤销。`,
                onConfirm: () => void xe(H.id, H.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(
                s,
                {
                  size: "small",
                  danger: !0,
                  icon: z ? e.createElement(z) : void 0
                },
                "删除"
              )
            )
          )
        )
      );
    })
  ), rt = K ? e.createElement(h) : N.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...N.map((H) => {
      const Ee = V[H.flow_id] || H.flow_id, Pe = hn(H), Fe = pl(H.node_statuses), ce = Object.entries(H.node_statuses || {}), Be = ce.filter(
        ([, De]) => ["success", "completed", "skipped", "cached"].includes(De)
      ).length, Ne = ce.filter(
        ([, De]) => ["error", "failed"].includes(De)
      ).length, He = ce.length > 0, st = H.status === "completed" || H.status === "success", Je = He ? Math.round(Be / ce.length * 100) : Pe ? 18 : st ? 100 : 0, $e = Array.isArray(H.events) ? H.events.filter(
        (De) => !!De && typeof De == "object"
      ).slice(-100) : [], dt = fe.has(H.run_id), ot = H.duration_ms && H.duration_ms > 0 ? H.duration_ms : H.finished_at && H.started_at ? (H.finished_at - H.started_at) * 1e3 : Pe && H.started_at ? (Date.now() / 1e3 - H.started_at) * 1e3 : 0;
      return e.createElement(
        l,
        {
          key: H.run_id,
          size: "small",
          style: {
            borderLeft: `3px solid ${Xn[H.status] === "green" ? "#52c41a" : Xn[H.status] === "red" ? "#ff4d4f" : "#1677ff"}`,
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
            f,
            { color: Xn[H.status] || "default" },
            H.resumed_by_run_id ? "已恢复" : H.status
          ),
          e.createElement(_, { strong: !0 }, Ee),
          e.createElement(
            x,
            { title: H.run_id },
            e.createElement(
              _,
              {
                type: "secondary",
                style: { fontFamily: "monospace", fontSize: 11 }
              },
              H.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            _,
            { type: "secondary", style: { fontSize: 12 } },
            ul(H.started_at)
          ),
          ot > 0 ? e.createElement(
            _,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${ml(ot)}`
          ) : null,
          Fe ? e.createElement(
            f,
            { color: "geekblue", style: { fontSize: 11 } },
            Fe
          ) : null,
          H.error ? e.createElement(
            x,
            { title: H.error },
            e.createElement(
              _,
              { type: "danger", style: { fontSize: 12 } },
              "（有错误）"
            )
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            Pe ? e.createElement(
              m,
              {
                title: "确认取消运行？",
                onConfirm: () => void Ie(H.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(
                s,
                {
                  size: "small",
                  danger: !0,
                  loading: Re.has(H.run_id),
                  icon: G ? e.createElement(G) : void 0
                },
                "取消运行"
              )
            ) : null,
            e.createElement(
              s,
              {
                size: "small",
                type: "link",
                onClick: () => ye((De) => {
                  const Oe = new Set(De);
                  return Oe.has(H.run_id) ? Oe.delete(H.run_id) : Oe.add(H.run_id), Oe;
                })
              },
              dt ? "收起过程" : "查看过程"
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "link",
                onClick: () => Wt(void 0, H.run_id)
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
          e.createElement(g, {
            percent: Je,
            size: "small",
            status: Ne || H.status === "failed" || H.status === "error" ? "exception" : Pe ? "active" : "success",
            showInfo: !1,
            style: { flex: 1, margin: 0 }
          }),
          e.createElement(
            _,
            {
              type: "secondary",
              style: { fontSize: 12, minWidth: 90, textAlign: "right" }
            },
            He ? `${Je}%` : "暂无节点进度"
          )
        ),
        dt && (ce.length > 0 || $e.length > 0 || H.error) ? e.createElement(
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
              ce.length > 0 ? `${Be}/${ce.length} 个 Agent 节点完成${Ne ? ` · ${Ne} 个失败` : ""}` : "暂无节点状态"
            )
          ),
          ce.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 7 } },
            ...ce.map(
              ([De, Oe], lt) => e.createElement(
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
                      background: qt(Oe) === "green" ? "#f6ffed" : qt(Oe) === "red" ? "#fff2f0" : "#e6f4ff",
                      color: qt(Oe) === "green" ? "#389e0d" : qt(Oe) === "red" ? "#cf1322" : "#1677ff",
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
                lt < ce.length - 1 ? e.createElement(
                  _,
                  {
                    type: "secondary",
                    style: { fontSize: 11 }
                  },
                  "→"
                ) : null,
                e.createElement(
                  f,
                  {
                    color: qt(Oe),
                    style: { margin: 0, fontSize: 11 }
                  },
                  Ai(Oe)
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
                marginTop: ce.length > 0 ? 10 : 0
              }
            },
            e.createElement(
              _,
              { strong: !0, style: { fontSize: 12 } },
              "执行事件"
            ),
            ...$e.map(
              (De, Oe) => e.createElement(
                _,
                {
                  key: `event-${Oe}`,
                  type: "secondary",
                  style: { fontSize: 12 }
                },
                gl(De, Oe)
              )
            )
          ) : null,
          H.error ? e.createElement(a, {
            type: "error",
            showIcon: !0,
            message: "运行错误",
            description: H.error,
            style: { marginTop: 10 }
          }) : null
        ) : null
      );
    })
  ), Ye = e.createElement(
    E,
    null,
    e.createElement(
      s,
      {
        icon: A ? e.createElement(A) : void 0,
        onClick: () => void re(),
        loading: K
      },
      "刷新"
    ),
    ke !== "templates" ? e.createElement(
      s,
      {
        type: "primary",
        icon: M ? e.createElement(M) : T ? e.createElement(T) : void 0,
        onClick: () => Wt(),
        disabled: !ie,
        style: nt
      },
      "打开流程编辑器"
    ) : null
  );
  return e.createElement(
    "div",
    null,
    ie ? null : e.createElement(a, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    ee ? e.createElement(a, {
      type: "error",
      showIcon: !0,
      message: "方案未应用",
      description: ee,
      style: { marginBottom: 12 }
    }) : null,
    e.createElement(
      u,
      {
        title: "审查工作流方案",
        open: !!Q,
        width: 720,
        onCancel: () => {
          le || (W(null), X(""));
        },
        onOk: () => void he(),
        okText: "应用并打开编辑器",
        cancelText: "放弃方案",
        confirmLoading: le === "apply",
        okButtonProps: { disabled: !(Q != null && Q.validation.ok) || !!le },
        cancelButtonProps: { disabled: !!le },
        closable: !le,
        maskClosable: !le
      },
      Q ? e.createElement(
        E,
        { direction: "vertical", style: { width: "100%" } },
        e.createElement(a, {
          type: Q.validation.ok ? "success" : "error",
          showIcon: !0,
          message: Q.validation.ok ? "结构验证通过，请检查业务逻辑" : "方案未通过验证",
          description: Q.validation.errors.join("；") || "确认后保存流程，可在编辑器配置业务输入并试运行。"
        }),
        ...Q.warnings.map(
          (H, Ee) => e.createElement(a, {
            key: `warning-${Ee}`,
            type: "warning",
            message: H
          })
        ),
        e.createElement(
          "ul",
          null,
          ...Q.changes.map(
            (H, Ee) => e.createElement("li", { key: Ee }, H.description)
          )
        ),
        ee ? e.createElement(a, {
          type: "error",
          message: ee
        }) : null
      ) : null
    ),
    e.createElement(y, {
      items: [
        { key: "templates", label: "工作流模板", children: Ge },
        {
          key: "mine",
          label: `我的工作流 (${q.length})`,
          children: qe
        },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            N.length,
            b ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${N.filter((H) => hn(H)).length} 活跃`
            ) : null,
            ")"
          ),
          children: rt
        }
      ],
      activeKey: ke,
      onChange: (H) => Ae(H),
      tabBarExtraContent: Ye
    })
  );
}
function Sa(e, t) {
  var i, a;
  const n = e.coordinatorName || ((i = e.members[0]) == null ? void 0 : i.name), r = e.members.find((s) => s.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((s) => s.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const s = Ti(t, n);
    if (s) return s;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((a = t[0]) == null ? void 0 : a.id) || null;
}
function ka() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function hl() {
  var ye, we, b, V;
  const e = P().React, { useState: t, useEffect: n, useCallback: r, useMemo: i } = e, a = (we = (ye = P()).useNavigate) == null ? void 0 : we.call(ye), s = r(
    (C) => {
      a ? a(C) : window.location.assign(C);
    },
    [a]
  ), {
    Spin: l,
    Empty: o,
    Input: d,
    Button: c,
    message: m,
    Tabs: u,
    Modal: p,
    Typography: E
  } = P().antd, {
    ReloadOutlined: h,
    PlusOutlined: y,
    SearchOutlined: g,
    TeamOutlined: f,
    UserOutlined: x
  } = P().antdIcons || {}, { Text: v, Paragraph: k } = E, [M, z] = t([]), [A, T] = t(!0), [F, G] = t(!1), [_, $] = t(null), [I, R] = t(""), [S, j] = t("全部专家"), [q, L] = t(!1), [N, J] = t(ka), [B, O] = t(
    null
  ), [K, U] = t(""), [ie, ue] = t(!1), [le, ae] = t(!1), [Q, W] = t(null), [ee, X] = t([]), D = r(async () => {
    T(!0);
    try {
      const C = await pn(), re = await Promise.all(
        C.map(async (ge) => {
          try {
            const [Z, he, xe, Ie] = await Promise.all(
              [
                Sr(ge.id).catch(() => null),
                jn(ge.id).catch(() => []),
                Cr(ge.id).catch(
                  () => []
                ),
                gi(ge.id).catch(() => null)
              ]
            );
            return {
              agent: ge,
              config: Z,
              skills: he,
              mcps: xe,
              presentation: Ie,
              loading: !1
            };
          } catch {
            return {
              agent: ge,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      z(re), X(C);
    } catch (C) {
      m.error(C.message || "加载专家列表失败"), z([]);
    } finally {
      T(!1);
    }
  }, []);
  n(() => {
    D();
  }, [D]), n(() => {
    const C = () => J(ka());
    return window.addEventListener("popstate", C), () => window.removeEventListener("popstate", C);
  }, []), n(() => {
    if (Q && le) {
      const C = M.find((re) => re.agent.id === Q.agent.id);
      C && C !== Q && W(C);
    }
  }, [M, Q, le]);
  const me = r(
    async (C) => {
      var he;
      const re = C.coordinatorName || ((he = C.members[0]) == null ? void 0 : he.name), ge = Sa(C, ee);
      if (!ge) {
        const xe = C.members.find(
          (Ie) => Ie.name === re
        );
        m.error(
          (xe == null ? void 0 : xe.bindingMode) === "fixed" ? `固定协调者「${re || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(C.taskTemplate)) {
        U(C.taskTemplate), O(C);
        return;
      }
      await ve(C, ge, C.taskTemplate);
    },
    [ee, m]
  ), ve = r(
    async (C, re, ge) => {
      ue(!0);
      try {
        const Z = ge || C.taskTemplate, he = C.custom ? `@${C.id}` : C.name, xe = `/ugsci-team ${C.mode} ${he} ${Z}`, Ie = P();
        Ie.setSelectedAgent && Ie.setSelectedAgent(re);
        const Ge = await Ko(re, xe, C.name);
        m.success(`OMP 工作流已启动：${C.name}（${C.mode}模式）`), O(null), s(`/chat/${Ge}`);
      } catch (Z) {
        m.error(Z.message || "发起团队任务失败");
      } finally {
        ue(!1);
      }
    },
    [m, s]
  ), de = r((C) => {
    $(C), G(!0);
  }, []), Y = r((C) => {
    W(C), ae(!0);
  }, []), be = r(
    (C) => {
      if (!C.agent.enabled) {
        m.warning(`专家「${C.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        if (C.agent.managed_by_app) {
          s(
            `/apps/${encodeURIComponent(C.agent.managed_by_app)}`
          );
          return;
        }
        if (C.agent.available_in_chat === !1)
          throw new Error("此专家不支持通用聊天，请从所属应用打开");
        const re = P();
        if (!re.setSelectedAgent)
          throw new Error("当前版本不支持切换专家，请更新软件后重试");
        re.setSelectedAgent(C.agent.id), sessionStorage.setItem("qwenpaw_pending_new_chat", "1"), s("/chat"), m.success(`已召唤专家「${C.agent.name}」`);
      } catch (re) {
        sessionStorage.removeItem("qwenpaw_pending_new_chat"), console.warn("[ugsci] Failed to set selected agent:", re), m.error(
          re instanceof Error ? re.message : "召唤专家失败，请重试"
        );
      }
    },
    [m, s]
  ), ke = i(() => {
    const C = I.trim().toLowerCase();
    return M.filter((re) => {
      const ge = an(re);
      return (S === "全部专家" || ge.category === S) && `${ge.name} ${ge.specialty} ${ge.summary} ${re.agent.name} ${re.agent.id} ${re.agent.description || ""} ${re.skills.map((Z) => Z.name).join(" ")}`.toLowerCase().includes(C);
    });
  }, [M, I, S]), Ae = M.filter((C) => C.agent.enabled).length, Re = M.reduce(
    (C, re) => C + re.skills.filter((ge) => ge.enabled !== !1).length,
    0
  ), Se = M.reduce((C, re) => C + re.mcps.length, 0), fe = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        x ? e.createElement(x, { style: { fontSize: 14 } }) : null,
        "专家"
      ),
      children: e.createElement(
        "div",
        { className: "ugsci-expert-library" },
        e.createElement("style", null, ui),
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
            prefix: g ? e.createElement(g) : void 0,
            value: I,
            onChange: (C) => R(C.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            c,
            {
              type: "primary",
              icon: y ? e.createElement(y) : void 0,
              onClick: () => L(!0),
              style: nt
            },
            "创建专家"
          )
        ),
        e.createElement(
          "nav",
          { className: "ugsci-expert-filters", "aria-label": "专家分类" },
          ...pi.map(
            (C) => e.createElement(
              "button",
              {
                key: C,
                type: "button",
                className: "ugsci-expert-filter",
                "aria-pressed": S === C,
                onClick: () => j(C)
              },
              C,
              e.createElement(
                "small",
                null,
                C === "全部专家" ? M.length : M.filter(
                  (re) => an(re).category === C
                ).length
              )
            )
          )
        ),
        // Content
        A ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : ke.length === 0 ? e.createElement(o, {
          description: I || S !== "全部专家" ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          "div",
          {
            className: "ugsci-expert-grid",
            "aria-live": "polite"
          },
          ...ke.map(
            (C) => e.createElement(
              "div",
              {
                key: C.agent.id,
                style: { display: "flex", minWidth: 0 }
              },
              e.createElement(Lo, {
                expert: C,
                onClick: () => de(C),
                onSummon: () => be(C),
                onConfigure: () => Y(C)
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
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(ol, {
        agents: ee,
        onLaunch: me
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (b = P().antdIcons) != null && b.ApartmentOutlined ? e.createElement(P().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(yl)
    }
  ];
  return e.createElement(
    "div",
    {
      className: N === "experts" ? "ugsci-expert-page" : void 0,
      style: { padding: 24 }
    },
    e.createElement(Bn, {
      title: "专家·协作",
      subtitle: N === "experts" ? `共 ${M.length} 位专家（${Ae} 位启用）· ${Re} 个技能 · ${Se} 个 MCP 客户端` : N === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        N === "experts" ? e.createElement(
          c,
          {
            icon: h ? e.createElement(h) : void 0,
            onClick: () => {
              Lt(), D();
            },
            loading: A
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(u, {
      items: fe,
      activeKey: N,
      onChange: (C) => {
        J(C);
        const re = new URL(window.location.href);
        C === "experts" ? re.searchParams.delete("section") : re.searchParams.set("section", C), window.history.pushState({}, "", `${re.pathname}${re.search}`);
      }
    }),
    // Drawer
    e.createElement(Bo, {
      onSummon: be,
      expert: _,
      open: F,
      onClose: () => G(!1),
      onRefresh: () => D()
    }),
    // Template Modal
    e.createElement(jo, {
      open: q,
      onClose: () => L(!1),
      onCreated: () => D()
    }),
    // Config Modal (gear icon)
    e.createElement(Mo, {
      expert: Q,
      open: le,
      onClose: () => ae(!1),
      onRefresh: () => D()
    }),
    // Team Launch Modal (for filling placeholders)
    B ? e.createElement(
      p,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Ir, {
            members: B.members.map((C) => C.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${B.name}`
          )
        ),
        onCancel: () => O(null),
        onOk: () => {
          const C = Sa(
            B,
            ee
          );
          if (!C) {
            m.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const re = K.trim() || B.taskTemplate;
          ve(B, C, re);
        },
        confirmLoading: ie,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          v,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(d.TextArea, {
          value: K,
          onChange: (C) => U(C.target.value),
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
          v,
          { style: { fontSize: 12, color: "var(--app-action-link)" } },
          `协调者: ${B.coordinatorName || ((V = B.members[0]) == null ? void 0 : V.name) || "—"} · 成员: ${B.members.map((C) => C.name).join("、")}`
        )
      )
    ) : null
  );
}
const El = `
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
@media(max-width:680px) { .ugsci-capabilities { padding:16px; } .ugsci-capability-detail { padding:16px; } }
`;
function sn({
  open: e,
  title: t,
  children: n,
  onClose: r,
  onCancel: i,
  onOk: a,
  extra: s,
  footer: l,
  confirmLoading: o,
  okText: d = "保存",
  ...c
}) {
  const m = P().React, { Button: u } = P().antd, { ArrowLeftOutlined: p } = P().antdIcons || {}, E = m.useId(), h = m.useRef(null);
  if (m.useEffect(() => {
    var f;
    if (!e) return;
    const g = document.activeElement;
    return (f = h.current) == null || f.focus(), () => {
      g != null && g.isConnected && g.focus();
    };
  }, [e]), !e) return null;
  const y = r || i;
  return m.createElement(
    "section",
    {
      className: "ugsci-capability-focus " + (c.rootClassName || ""),
      "aria-labelledby": E,
      ref: h,
      tabIndex: -1,
      style: { outline: "none" }
    },
    m.createElement(
      u,
      {
        type: "text",
        onClick: y,
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
        m.createElement("h2", { id: E }, t),
        s
      ),
      n,
      l || a ? m.createElement(
        "div",
        { className: "ugsci-capability-detail-footer" },
        l || m.createElement(
          u,
          { type: "primary", loading: o, onClick: a },
          d
        )
      ) : null
    )
  );
}
function bl({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const i = P().React, { useState: a, useEffect: s, useCallback: l, useRef: o, useMemo: d } = i, {
    Input: c,
    Spin: m,
    Empty: u,
    Button: p,
    Row: E,
    Col: h,
    Card: y,
    Tag: g,
    Checkbox: f,
    Modal: x,
    Typography: v,
    Switch: k,
    Descriptions: M,
    message: z
  } = P().antd, {
    ReloadOutlined: A,
    ThunderboltOutlined: T,
    SettingOutlined: F,
    CheckSquareOutlined: G,
    EyeOutlined: _,
    EyeInvisibleOutlined: $,
    DeleteOutlined: I,
    CloseOutlined: R
  } = P().antdIcons || {}, { Text: S, Paragraph: j } = v, [q, L] = a([]), [N, J] = a(""), [B, O] = a(""), K = d(() => {
    const Z = B.trim().toLowerCase();
    return Z ? q.filter(
      (he) => [he.name, he.description, ...he.tags || []].some(
        (xe) => xe == null ? void 0 : xe.toLowerCase().includes(Z)
      )
    ) : q;
  }, [q, B]), [U, ie] = a(!0), [ue, le] = a(!1), [ae, Q] = a(null), [W, ee] = a(!1), [X, D] = a(/* @__PURE__ */ new Set()), [me, ve] = a(!1), de = o(0), Y = o(e);
  Y.current = e;
  const [be, ke] = a(!1), Ae = l(async () => {
    if (!e || Y.current !== e) return;
    const Z = ++de.current;
    ie(!0);
    try {
      const he = await jn(e);
      Z === de.current && Y.current === e && (L(he), J(e));
    } catch (he) {
      if (Z !== de.current || Y.current !== e)
        return;
      z.error(he.message || "加载技能失败"), L([]), J(e);
    } finally {
      Z === de.current && Y.current === e && ie(!1);
    }
  }, [e]);
  s(() => (le(!1), Q(null), ee(!1), D(/* @__PURE__ */ new Set()), () => {
    de.current++;
  }), [e]), s(() => {
    Ae();
  }, [Ae, n]);
  const Re = (Z) => {
    D((he) => {
      const xe = new Set(he);
      return xe.has(Z) ? xe.delete(Z) : xe.add(Z), xe;
    });
  }, Se = () => D(/* @__PURE__ */ new Set()), fe = () => D(new Set(q.map((Z) => Z.name))), ye = () => {
    W ? (Se(), ee(!1)) : ee(!0);
  }, we = async () => {
    const Z = Array.from(X);
    if (Z.length !== 0) {
      ve(!0);
      try {
        const { results: he } = await mo(e, Z), xe = Object.entries(he).filter(
          ([, Ge]) => Ge.success === !1
        ), Ie = Z.length - xe.length;
        xe.length > 0 ? z.warning(
          `批量启用完成：成功 ${Ie} 个，失败 ${xe.length} 个`
        ) : z.success(`成功启用 ${Z.length} 个技能`), Se(), await Ae();
      } catch (he) {
        z.error(he.message || "批量启用失败");
      } finally {
        ve(!1);
      }
    }
  }, b = async () => {
    const Z = Array.from(X);
    if (Z.length !== 0) {
      ve(!0);
      try {
        const { results: he } = await po(e, Z), xe = Object.entries(he).filter(
          ([, Ge]) => Ge.success === !1
        ), Ie = Z.length - xe.length;
        xe.length > 0 ? z.warning(
          `批量停用完成：成功 ${Ie} 个，失败 ${xe.length} 个`
        ) : z.success(`成功停用 ${Z.length} 个技能`), Se(), await Ae();
      } catch (he) {
        z.error(he.message || "批量停用失败");
      } finally {
        ve(!1);
      }
    }
  }, V = () => {
    const Z = Array.from(X);
    Z.length !== 0 && x.confirm({
      title: `确认删除 ${Z.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ve(!0);
        try {
          const { results: he } = await go(e, Z), xe = Object.entries(he).filter(
            ([, Ge]) => Ge.success === !1
          ), Ie = Z.length - xe.length;
          xe.length > 0 ? z.warning(
            `批量删除完成：成功 ${Ie} 个，失败 ${xe.length} 个`
          ) : z.success(`成功删除 ${Z.length} 个技能`), Se(), await Ae();
        } catch (he) {
          z.error(he.message || "批量删除失败");
        } finally {
          ve(!1);
        }
      }
    });
  }, C = async (Z) => {
    ke(!0);
    try {
      Z.enabled === !1 ? (await yi(e, Z.name), z.success(`已启用技能「${Z.name}」`)) : (await Ei(e, Z.name), z.success(`已禁用技能「${Z.name}」`)), await Ae();
    } catch (he) {
      z.error(he.message || "操作失败");
    } finally {
      ke(!1);
    }
  }, re = (Z) => {
    x.confirm({
      title: `确认删除技能「${Z.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ke(!0);
        try {
          await _r(e, Z.name), Y.current === e && le(!1), z.success(`已删除技能「${Z.name}」`), await Ae();
        } catch (he) {
          z.error(he.message || "删除失败");
        } finally {
          ke(!1);
        }
      }
    });
  }, ge = ue && N === e;
  return i.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": ge },
    i.createElement(
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
      i.createElement(c, {
        placeholder: "搜索当前专家的技能...",
        value: B,
        allowClear: !0,
        style: { maxWidth: 320 },
        onChange: (Z) => O(Z.target.value)
      }),
      i.createElement(
        S,
        { type: "secondary", style: { fontSize: 13 } },
        W ? `已选择 ${X.size} / ${q.length} 个技能` : `共 ${q.length} 个技能`
      ),
      i.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap"
          }
        },
        W ? i.createElement(
          i.Fragment,
          null,
          i.createElement(
            p,
            { size: "small", onClick: fe },
            "全选"
          ),
          i.createElement(
            p,
            {
              size: "small",
              icon: R ? i.createElement(R) : void 0,
              onClick: Se
            },
            "取消选择"
          ),
          i.createElement(
            p,
            {
              size: "small",
              type: "default",
              icon: _ ? i.createElement(_) : void 0,
              disabled: X.size === 0 || me,
              loading: me,
              onClick: we
            },
            "批量启用"
          ),
          i.createElement(
            p,
            {
              size: "small",
              danger: !0,
              icon: $ ? i.createElement($) : void 0,
              disabled: X.size === 0 || me,
              loading: me,
              onClick: b
            },
            "批量停用"
          ),
          i.createElement(
            p,
            {
              size: "small",
              danger: !0,
              icon: I ? i.createElement(I) : void 0,
              disabled: X.size === 0 || me,
              loading: me,
              onClick: V
            },
            `删除 (${X.size})`
          ),
          i.createElement(
            p,
            {
              size: "small",
              type: "primary",
              onClick: ye
            },
            "退出批量"
          )
        ) : i.createElement(
          i.Fragment,
          null,
          i.createElement(
            p,
            {
              size: "small",
              icon: G ? i.createElement(G) : void 0,
              onClick: ye,
              disabled: K.length === 0
            },
            "批量管理"
          ),
          i.createElement(
            p,
            {
              icon: A ? i.createElement(A) : void 0,
              onClick: () => {
                Lt(), Ae();
              }
            },
            "刷新"
          )
        )
      )
    ),
    U || N !== e ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      i.createElement(m, { size: "large" })
    ) : q.length === 0 ? i.createElement(u, {
      description: B ? "未找到匹配的技能" : "当前智能体未加载任何技能"
    }) : i.createElement(
      E,
      { gutter: [12, 12] },
      ...K.map(
        (Z) => i.createElement(
          h,
          { key: Z.name, xs: 24, sm: 12, md: 12, lg: 8, xxl: 6 },
          i.createElement(
            y,
            { size: "small", className: "ugsci-capability-card" },
            i.createElement(
              "div",
              { className: "ugsci-capability-card-title" },
              i.createElement(
                "span",
                {
                  className: "ugsci-capability-avatar",
                  "aria-hidden": !0
                },
                Z.emoji || "⚡"
              ),
              i.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    Q(Z), le(!0);
                  }
                },
                Z.name
              ),
              W ? i.createElement(f, {
                "aria-label": `选择 ${Z.name}`,
                checked: X.has(Z.name),
                onChange: () => Re(Z.name)
              }) : null
            ),
            i.createElement(
              j,
              {
                className: "ugsci-capability-card-copy",
                ellipsis: { rows: 2 },
                style: { margin: 0 }
              },
              Z.description || "暂无描述"
            ),
            i.createElement(
              "div",
              { className: "ugsci-capability-card-meta" },
              Z.version_text ? i.createElement(g, null, `v${Z.version_text}`) : null,
              ...(Z.tags || []).slice(0, 3).map((he) => i.createElement(g, { key: he }, he))
            ),
            W ? null : i.createElement(
              "div",
              { className: "ugsci-capability-card-footer" },
              i.createElement(
                p,
                {
                  size: "small",
                  onClick: () => {
                    Q(Z), le(!0);
                  },
                  "aria-label": `配置 ${Z.name}`
                },
                "配置"
              ),
              i.createElement(
                "span",
                {
                  style: {
                    display: "flex",
                    gap: 8,
                    alignItems: "center"
                  }
                },
                i.createElement(
                  S,
                  { type: "secondary", style: { fontSize: 12 } },
                  Z.enabled === !1 ? "已禁用" : "已启用"
                ),
                i.createElement(k, {
                  size: "small",
                  checked: Z.enabled !== !1,
                  loading: be,
                  "aria-label": `${Z.enabled === !1 ? "启用" : "禁用"} ${Z.name}`,
                  onChange: () => C(Z)
                })
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    ae ? i.createElement(
      sn,
      {
        title: i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          i.createElement(
            "span",
            { style: { fontSize: 18 } },
            ae.emoji || "⚡"
          ),
          i.createElement("span", null, ae.name)
        ),
        open: ge,
        onClose: () => le(!1),
        width: 520,
        footer: i.createElement(
          p,
          {
            danger: !0,
            disabled: be,
            onClick: () => re(ae)
          },
          "删除技能"
        ),
        extra: i.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: F ? i.createElement(F) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      i.createElement(
        M,
        { column: 1, bordered: !0, size: "small" },
        i.createElement(
          M.Item,
          { label: "技能名称" },
          ae.name
        ),
        i.createElement(
          M.Item,
          { label: "描述" },
          ae.description || "-"
        ),
        ae.version_text ? i.createElement(
          M.Item,
          { label: "版本" },
          ae.version_text
        ) : null,
        i.createElement(
          M.Item,
          { label: "来源" },
          ae.source || "-"
        ),
        i.createElement(
          M.Item,
          { label: "状态" },
          ae.enabled === !1 ? "已禁用" : "已启用"
        ),
        ae.installed_from ? i.createElement(
          M.Item,
          { label: "安装来源" },
          ae.installed_from
        ) : null
      ),
      // Tags
      ae.tags && ae.tags.length > 0 ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          S,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        i.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...ae.tags.map(
            (Z, he) => i.createElement(g, { key: he, color: "blue" }, Z)
          )
        )
      ) : null,
      // Skill content preview
      ae.content ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          S,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        i.createElement(
          "div",
          {
            style: {
              maxHeight: 300,
              overflow: "auto",
              padding: 12,
              background: "var(--app-fill, #f5f5f5)",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          ae.content.slice(0, 2e3) + (ae.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function vl({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: i,
  onSkillInstalled: a,
  agentId: s,
  agentName: l
}) {
  const o = P().React, { useState: d, useMemo: c, useCallback: m, useEffect: u, useRef: p } = o, {
    Spin: E,
    Empty: h,
    Input: y,
    Button: g,
    Row: f,
    Col: x,
    Card: v,
    Tag: k,
    Typography: M,
    Descriptions: z,
    List: A,
    Modal: T,
    message: F
  } = P().antd, {
    ReloadOutlined: G,
    SearchOutlined: _,
    DownloadOutlined: $,
    ThunderboltOutlined: I,
    DeleteOutlined: R,
    PlusOutlined: S
  } = P().antdIcons || {}, { Text: j, Paragraph: q } = M, [L, N] = d(""), [J, B] = d(!1), [O, K] = d(null), [U, ie] = d([]), [ue, le] = d(!1), [ae, Q] = d(24), W = p(0), [ee, X] = d(!1), D = p(0), me = p(null), ve = c(
    () => {
      var b;
      return new Set(
        ((b = t.find((V) => V.agent_id === s)) == null ? void 0 : b.skill_names) || []
      );
    },
    [t, s]
  ), de = c(() => {
    if (!L.trim()) return e;
    const b = L.toLowerCase();
    return e.filter(
      (V) => {
        var C, re;
        return V.name.toLowerCase().includes(b) || ((C = V.description) == null ? void 0 : C.toLowerCase().includes(b)) || ((re = V.tags) == null ? void 0 : re.some((ge) => ge.toLowerCase().includes(b)));
      }
    );
  }, [e, L]), Y = c(
    () => de.slice(0, ae),
    [de, ae]
  );
  u(() => {
    if (Y.length >= de.length) return;
    const b = me.current;
    if (!b) return;
    const V = () => {
      Q(
        (re) => Math.min(re + 24, de.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const re = new IntersectionObserver(
        (ge) => {
          ge.some((Z) => Z.isIntersecting) && V();
        },
        { rootMargin: "240px 0px" }
      );
      return re.observe(b), () => re.disconnect();
    }
    const C = () => {
      b.getBoundingClientRect().top <= window.innerHeight + 240 && V();
    };
    return window.addEventListener("scroll", C, { passive: !0 }), C(), () => window.removeEventListener("scroll", C);
  }, [de.length, Y.length]);
  const be = m((b) => {
    N(b), Q(24);
  }, []), ke = m(() => {
    const b = D.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: b, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = b);
    });
  }, []), Ae = m(async () => {
    var b;
    D.current = ((b = document.scrollingElement) == null ? void 0 : b.scrollTop) ?? window.scrollY ?? 0;
    try {
      await i();
    } finally {
      ke();
    }
  }, [i, ke]), Re = m(
    (b) => {
      const V = [];
      for (const C of t)
        if (C.skill_names.includes(b)) {
          const re = n.find((ge) => ge.id === C.agent_id);
          V.push((re == null ? void 0 : re.name) || C.agent_name || C.agent_id);
        }
      return V;
    },
    [t, n]
  ), Se = m(
    async (b) => {
      const V = ++W.current;
      if (K(b), le(!1), ie(Re(b.name)), B(!0), !b.content) {
        le(!0);
        try {
          const C = await ao(b.name);
          V === W.current && K({ ...b, content: C });
        } catch {
        } finally {
          V === W.current && le(!1);
        }
      }
    },
    [Re]
  );
  u(() => {
    O && ie(Re(O.name));
  }, [O, Re, t]);
  const fe = async (b) => {
    X(!0);
    try {
      await kr(s, b.name), F.success(
        `已将技能「${b.name}」加载到当前专家「${l}」`
      ), a(b);
    } catch (V) {
      F.error(V.message || "加载技能失败");
    } finally {
      X(!1);
    }
  }, ye = (b) => {
    if (b.protected) {
      F.warning("内置技能不可删除");
      return;
    }
    T.confirm({
      title: `确认从技能池删除「${b.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        X(!0);
        try {
          await yo(b.name), F.success(`已从技能池删除「${b.name}」`), await Ae();
        } catch (V) {
          F.error(V.message || "删除失败");
        } finally {
          X(!1);
        }
      }
    });
  }, we = (b) => {
    window.history.pushState({}, "", b), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return o.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": J },
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
      o.createElement(y, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: _ ? o.createElement(_) : void 0,
        value: L,
        onChange: (b) => be(b.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          g,
          {
            icon: G ? o.createElement(G) : void 0,
            onClick: Ae,
            loading: r,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          g,
          {
            type: "primary",
            icon: $ ? o.createElement($) : void 0,
            onClick: () => we("/skill-pool"),
            size: "small",
            style: nt
          },
          "管理技能池"
        )
      )
    ),
    r ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(E, { size: "large" })
    ) : de.length === 0 ? o.createElement(h, {
      description: L ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        f,
        { gutter: [12, 12] },
        ...Y.map(
          (b) => o.createElement(
            x,
            { key: b.name, xs: 24, sm: 12, md: 12, lg: 8, xxl: 6 },
            o.createElement(
              v,
              {
                hoverable: !0,
                size: "small",
                className: "ugsci-capability-card",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => Se(b)
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
                b.emoji ? o.createElement(
                  "span",
                  { className: "ugsci-capability-avatar" },
                  b.emoji
                ) : o.createElement(
                  "span",
                  { className: "ugsci-capability-avatar" },
                  "⚡"
                ),
                o.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: (V) => {
                      V.stopPropagation(), Se(b);
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
                  b.name
                ),
                b.protected ? o.createElement(
                  k,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              b.description ? o.createElement(
                q,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 2 }
                },
                b.description
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
                b.version_text ? o.createElement(
                  k,
                  { style: { fontSize: 10 } },
                  `v${b.version_text}`
                ) : null,
                ...(b.tags || []).slice(0, 3).map(
                  (V, C) => o.createElement(
                    k,
                    { key: C, color: "cyan", style: { fontSize: 10 } },
                    V
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
                  g,
                  {
                    size: "small",
                    type: "primary",
                    icon: S ? o.createElement(S) : void 0,
                    disabled: ee || ve.has(b.name),
                    onClick: (V) => {
                      V.stopPropagation(), fe(b);
                    }
                  },
                  ve.has(b.name) ? "已加载" : "添加到当前专家"
                ),
                o.createElement(
                  g,
                  {
                    size: "small",
                    danger: !0,
                    icon: R ? o.createElement(R) : void 0,
                    disabled: ee || b.protected,
                    onClick: (V) => {
                      V.stopPropagation(), ye(b);
                    }
                  },
                  "删除"
                )
              )
            )
          )
        ),
        // Infinite-scroll sentinel
        Y.length < de.length ? o.createElement(
          "div",
          {
            ref: me,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          o.createElement(
            j,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${de.length - Y.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    O ? o.createElement(
      sn,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            O.emoji || "⚡"
          ),
          o.createElement("span", null, O.name)
        ),
        open: J,
        onClose: () => {
          W.current++, B(!1);
        },
        width: 520,
        extra: o.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: I ? o.createElement(I) : void 0,
            onClick: () => we("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        z,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          z.Item,
          { label: "技能名称" },
          O.name
        ),
        o.createElement(
          z.Item,
          { label: "描述" },
          O.description || "-"
        ),
        O.version_text ? o.createElement(
          z.Item,
          { label: "版本" },
          O.version_text
        ) : null,
        o.createElement(
          z.Item,
          { label: "来源" },
          O.source || "-"
        ),
        o.createElement(
          z.Item,
          { label: "受保护" },
          O.protected ? "是（内置）" : "否"
        ),
        O.sync_status ? o.createElement(
          z.Item,
          { label: "同步状态" },
          O.sync_status
        ) : null,
        O.installed_from ? o.createElement(
          z.Item,
          { label: "安装来源" },
          O.installed_from
        ) : null
      ),
      // Tags
      O.tags && O.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          j,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...O.tags.map(
            (b, V) => o.createElement(k, { key: V, color: "cyan" }, b)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          j,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${U.length})`
        ),
        U.length > 0 ? o.createElement(A, {
          size: "small",
          dataSource: U,
          renderItem: (b) => o.createElement(
            A.Item,
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
              o.createElement(it, {
                name: b,
                size: 20
              }),
              o.createElement(
                j,
                { style: { fontSize: 13 } },
                b
              )
            )
          )
        }) : o.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      ue ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(E, { size: "small" })
      ) : O.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          j,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        o.createElement(
          "div",
          {
            style: {
              maxHeight: 300,
              overflow: "auto",
              padding: 12,
              background: "var(--app-fill, #f5f5f5)",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          O.content.slice(0, 2e3) + (O.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function wl({
  embedded: e = !1
} = {}) {
  const t = P().React, { useState: n, useEffect: r, useCallback: i, useMemo: a } = t, { Tabs: s, message: l } = P().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = P().antdIcons || {}, m = P().useSelectedAgent, u = m ? m() : null, p = (u == null ? void 0 : u.id) || "default";
  r(() => {
    wr();
  }, [p]);
  const [E, h] = n([]), [y, g] = n([]), [f, x] = n([]), [v, k] = n(!0), [M, z] = n("agent-skills"), [A, T] = n(0), F = i(async () => {
    k(!0);
    try {
      const [S, j, q] = await Promise.all([
        Nn(!0),
        pn(),
        io()
      ]);
      g(S), h(j), x(q);
    } catch (S) {
      l.error(S.message || "加载技能列表失败"), g([]);
    } finally {
      k(!1);
    }
  }, []);
  r(() => {
    F();
  }, [F]);
  const G = a(() => {
    const S = E.find((j) => j.id === p);
    return (S == null ? void 0 : S.name) || p;
  }, [E, p]), _ = i(
    (S) => {
      x(
        (j) => j.some((q) => q.agent_id === p) ? j.map((q) => q.agent_id !== p || q.skill_names.includes(S.name) ? q : {
          ...q,
          skill_names: [...q.skill_names, S.name]
        }) : [
          ...j,
          {
            agent_id: p,
            agent_name: G,
            skill_names: [S.name]
          }
        ]
      ), T((j) => j + 1);
    },
    [p, G]
  ), $ = (S) => {
    window.history.pushState({}, "", S), window.dispatchEvent(new PopStateEvent("popstate"));
  }, I = [
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
      children: t.createElement(bl, {
        agentId: p,
        agentName: G,
        refreshKey: A,
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
      children: t.createElement(vl, {
        poolSkills: y,
        workspaceSkills: f,
        agents: E,
        loading: v,
        onReload: F,
        onSkillInstalled: _,
        agentId: p,
        agentName: G
      })
    }
  ], R = t.createElement(s, {
    items: I,
    activeKey: M,
    onChange: (S) => z(S)
  });
  return e ? R : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Bn, {
      title: "技能",
      subtitle: `技能池共 ${y.length} 个技能 · 当前智能体：${G}`
    }),
    R
  );
}
const sr = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, zi = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Ri = /* @__PURE__ */ new Set([
  "cmg",
  "comsol",
  "tnavigator",
  "eclipse",
  "intersect",
  "visage"
]);
function Pi(e) {
  return Ln(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function xl() {
  return pe("/ugsci/engines/list");
}
async function Sl(e) {
  return pe("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function kl(e, t) {
  return pe(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    {
      method: "PUT",
      body: JSON.stringify(t)
    }
  );
}
async function _l(e) {
  return pe(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Cl() {
  return pe("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Tl({
  engine: e,
  onClick: t,
  onConfigure: n
}) {
  const r = P().React, { Card: i, Tag: a, Typography: s, Button: l } = P().antd, o = e.status === "detected" ? ["success", "已检测"] : e.status === "configured" ? ["processing", "已配置"] : e.status === "error" ? ["error", "检测异常"] : e.executable_path ? ["warning", "路径无效"] : ["default", "待配置"];
  return r.createElement(
    i,
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
        Ri.has(e.id) ? r.createElement("img", {
          src: Pi(e.id),
          alt: e.name
        }) : zi[e.category] || "📦"
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
        a,
        null,
        sr[e.category] || e.category
      ) : null,
      ...(e.modules || []).map(
        (d) => r.createElement(a, { key: d }, d)
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
        a,
        { color: o[0], style: { margin: 0 } },
        o[1]
      )
    )
  );
}
function Il() {
  const e = P().React, { useState: t, useEffect: n, useCallback: r, useMemo: i } = e, {
    Spin: a,
    Empty: s,
    Button: l,
    message: o,
    Row: d,
    Col: c,
    Descriptions: m,
    Tag: u,
    Typography: p,
    Input: E,
    Select: h,
    Popconfirm: y,
    Space: g
  } = P().antd, {
    ReloadOutlined: f,
    SearchOutlined: x,
    PlusOutlined: v,
    EditOutlined: k,
    DeleteOutlined: M,
    CopyOutlined: z,
    ExperimentOutlined: A
  } = P().antdIcons || {}, { Text: T, Paragraph: F } = p, [G, _] = t([]), [$, I] = t(!0), [R, S] = t(""), [j, q] = t(!1), [L, N] = t(null), [J, B] = t(!1), [O, K] = t(null), [U, ie] = t({}), [ue, le] = t(!1), ae = r(async () => {
    I(!0);
    try {
      const Y = await xl();
      _(Y.engines || []);
    } catch (Y) {
      o.error(Y.message || "加载引擎列表失败"), _([]);
    } finally {
      I(!1);
    }
  }, []);
  n(() => {
    ae();
  }, [ae]);
  const Q = i(() => {
    if (!R.trim()) return G;
    const Y = R.toLowerCase();
    return G.filter(
      (be) => {
        var ke;
        return be.name.toLowerCase().includes(Y) || be.vendor.toLowerCase().includes(Y) || be.category.toLowerCase().includes(Y) || ((ke = be.description) == null ? void 0 : ke.toLowerCase().includes(Y));
      }
    );
  }, [G, R]), W = r((Y) => {
    navigator.clipboard.writeText(Y).then(() => o.success("路径已复制")).catch(() => o.error("复制失败"));
  }, []), ee = r(() => {
    K(null), ie({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), B(!0);
  }, []), X = r((Y) => {
    K(Y), ie({ ...Y }), B(!0), q(!1);
  }, []), D = r(async () => {
    var Y;
    if (!((Y = U.name) != null && Y.trim())) {
      o.warning("请输入引擎名称");
      return;
    }
    le(!0);
    try {
      O ? (await kl(O.id, U), o.success("引擎已更新")) : (await Sl(U), o.success("引擎已添加")), B(!1), ae();
    } catch (be) {
      o.error(be.message || "保存失败");
    } finally {
      le(!1);
    }
  }, [U, O, ae]), me = r(
    async (Y) => {
      try {
        await _l(Y), o.success("引擎已删除"), q(!1), ae();
      } catch (be) {
        o.error(be.message || "删除失败");
      }
    },
    [ae]
  ), ve = r(async () => {
    I(!0);
    try {
      const Y = await Cl();
      _(Y.engines || []), o.success("自动检测完成");
    } catch (Y) {
      o.error(Y.message || "检测失败");
    } finally {
      I(!1);
    }
  }, []), de = r(
    (Y, be, ke) => {
      const Ae = U[be] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          "label",
          {
            htmlFor: `engine-${be}`,
            style: { fontSize: 13, display: "block", marginBottom: 4 }
          },
          Y
        ),
        ke != null && ke.select ? e.createElement(h, {
          id: `engine-${be}`,
          value: Ae || void 0,
          onChange: (Re) => ie((Se) => ({ ...Se, [be]: Re })),
          style: { width: "100%" },
          options: ke.select.options,
          allowClear: !0,
          placeholder: `选择${Y}`
        }) : ke != null && ke.textarea ? e.createElement(E.TextArea, {
          id: `engine-${be}`,
          value: Ae,
          onChange: (Re) => ie((Se) => ({
            ...Se,
            [be]: Re.target.value
          })),
          rows: 3,
          placeholder: `输入${Y}`
        }) : e.createElement(E, {
          id: `engine-${be}`,
          value: Ae,
          onChange: (Re) => ie((Se) => ({
            ...Se,
            [be]: Re.target.value
          })),
          placeholder: `输入${Y}`
        })
      );
    },
    [U]
  );
  return e.createElement(
    "div",
    {
      className: "ugsci-capability-section",
      "data-focused": j || J
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
      e.createElement(E, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: x ? e.createElement(x) : void 0,
        value: R,
        onChange: (Y) => S(Y.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        l,
        {
          icon: f ? e.createElement(f) : void 0,
          onClick: ve,
          loading: $
        },
        "自动检测"
      ),
      e.createElement(
        l,
        {
          type: "primary",
          icon: v ? e.createElement(v) : void 0,
          onClick: ee,
          style: nt
        },
        "添加引擎"
      )
    ),
    // Content
    $ ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : Q.length === 0 ? e.createElement(s, {
      description: R ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...Q.map(
        (Y) => e.createElement(
          c,
          {
            key: Y.id,
            xs: 24,
            sm: 12,
            md: 12,
            lg: 8,
            xxl: 6,
            style: { display: "flex" }
          },
          e.createElement(Tl, {
            engine: Y,
            onConfigure: () => X(Y),
            onClick: () => {
              N(Y), q(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    L ? e.createElement(
      sn,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Ri.has(L.id) ? e.createElement("img", {
              src: Pi(L.id),
              alt: L.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              zi[L.category] || "📦"
            )
          ),
          e.createElement("span", null, L.name)
        ),
        open: j,
        onClose: () => q(!1),
        width: 520,
        extra: e.createElement(
          g,
          null,
          e.createElement(
            l,
            {
              size: "small",
              icon: k ? e.createElement(k) : void 0,
              onClick: () => X(L)
            },
            "编辑"
          ),
          L.is_default ? null : e.createElement(
            y,
            {
              title: "确认删除此引擎？",
              description: L.name,
              onConfirm: () => me(L.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              l,
              {
                size: "small",
                danger: !0,
                icon: M ? e.createElement(M) : void 0
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
          L.name
        ),
        e.createElement(
          m.Item,
          { label: "厂商" },
          L.vendor || "—"
        ),
        e.createElement(
          m.Item,
          { label: "分类" },
          L.category ? sr[L.category] || L.category : "—"
        ),
        e.createElement(
          m.Item,
          { label: "状态" },
          e.createElement(
            u,
            {
              color: L.status === "detected" ? "success" : L.status === "not_found" ? "error" : "default"
            },
            L.status === "detected" ? "✅ 已检测" : L.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          m.Item,
          { label: "版本" },
          L.version || "—"
        ),
        L.executable_path ? e.createElement(
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
              L.executable_path
            ),
            e.createElement(l, {
              size: "small",
              type: "text",
              icon: z ? e.createElement(z) : void 0,
              onClick: () => W(L.executable_path)
            })
          )
        ) : null,
        L.install_dir ? e.createElement(
          m.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            L.install_dir
          )
        ) : null,
        // Display detected modules with paths
        L.modules && L.modules.length > 0 ? e.createElement(
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
            ...L.modules.map(
              (Y) => e.createElement(
                "div",
                {
                  key: Y,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }
                },
                e.createElement(
                  u,
                  { color: "cyan", style: { fontSize: 11 } },
                  Y
                ),
                L.module_paths && L.module_paths[Y] ? e.createElement(
                  "code",
                  {
                    style: { fontSize: 11, wordBreak: "break-all" }
                  },
                  L.module_paths[Y]
                ) : null
              )
            )
          )
        ) : null,
        L.license_server ? e.createElement(
          m.Item,
          { label: "许可证服务器" },
          L.license_server
        ) : null,
        e.createElement(
          m.Item,
          { label: "描述" },
          L.description || "—"
        )
      ),
      // Invocation hint
      L.invocation_hint ? e.createElement(
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
          T,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          L.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        L.is_default ? e.createElement(u, { color: "blue" }, "默认引擎") : L.is_custom ? e.createElement(u, { color: "purple" }, "自定义引擎") : null
      )
    ) : null,
    // Add/Edit configuration
    e.createElement(
      sn,
      {
        title: O ? `配置 ${O.name}` : "添加引擎",
        open: J,
        onOk: D,
        onCancel: () => B(!1),
        okText: O ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: ue,
        width: 560
      },
      e.createElement(
        "div",
        null,
        de("引擎名称 *", "name"),
        de("可执行文件路径", "executable_path"),
        de("安装目录", "install_dir"),
        de("许可证服务器", "license_server"),
        e.createElement(
          "details",
          { className: "ugsci-capability-advanced" },
          e.createElement("summary", null, "更多设置"),
          de("厂商", "vendor"),
          de("版本", "version"),
          de("分类", "category", {
            select: {
              options: Object.entries(sr).map(
                ([Y, be]) => ({
                  label: be,
                  value: Y
                })
              )
            }
          }),
          de("描述", "description", { textarea: !0 }),
          de("调用方式提示", "invocation_hint", { textarea: !0 })
        )
      )
    )
  );
}
async function $l(e = !1) {
  const t = await pe(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function Al(e = !1) {
  return pe(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function zl() {
  return pe("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function Rl(e) {
  return pe(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
function or(e) {
  return pe(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/runtime`,
    { bypassCache: !0 }
  );
}
function Pl(e) {
  return pe(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/install`,
    { method: "POST" }
  );
}
function Ol(e) {
  return pe(
    `/ugsci/domain-engines/install-tasks/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function Ml(e, t = !1) {
  const n = await pe("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function Ll(e, t = !1) {
  const n = /* @__PURE__ */ new Map(), r = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let i;
  try {
    i = await pe("/mcp", r) || [];
  } catch {
    return n;
  }
  for (const a of i) {
    const s = a.key;
    if (!a.enabled) {
      n.set(s, { key: s, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const l = await pe(
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
function _a(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function Ca(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function Bl(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, i = e.dependency_status;
  let a, s = "", l, o;
  if (r.provider.kind === "driver")
    i.overall === "unavailable" ? a = "needs_install" : i.overall !== "available" ? a = "unknown" : a = Ca(t), l = (t == null ? void 0 : t.toolCount) ?? 0, o = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const d = _a(i), c = [
      ...new Set(r.operations.flatMap((h) => h.tool_names))
    ], m = c.filter(
      (h) => n.has(h)
    ), u = m.filter(
      (h) => {
        var y;
        return (y = n.get(h)) == null ? void 0 : y.enabled;
      }
    );
    d !== "available" ? a = d : m.length !== c.length ? a = "error" : u.length === 0 ? a = "unconfigured" : u.length < c.length ? a = "partial" : a = "available", l = u.length, o = null;
    const p = c.filter((h) => !n.has(h)), E = m.filter(
      (h) => {
        var y;
        return !((y = n.get(h)) != null && y.enabled);
      }
    );
    d === "available" && (s = p.length ? `工具未完整注册：${p.join("、")}` : E.length ? `当前专家已启用 ${u.length}/${c.length} 个工具；未启用：${E.join("、")}` : c.length ? `依赖检测通过，当前专家已启用全部 ${c.length} 个工具。` : "该能力未声明可调用工具。");
  } else r.source === "mcp" ? (a = Ca(t), l = (t == null ? void 0 : t.toolCount) ?? 0, o = (t == null ? void 0 : t.key) ?? r.provider.id) : (a = _a(i), l = 0, o = null, s = "依据运行依赖检测结果判断，尚未校验当前专家的调用工具。");
  if (i.overall !== "available") {
    const d = i.dependencies.filter(
      (c) => c.status !== "available"
    );
    s = d.length ? d.map(
      (c) => `${c.name}：${c.status === "unavailable" ? "未检测到可用依赖" : "尚未确认"}${c.reason ? `（${c.reason}）` : ""}`
    ).join("；") : "尚未确认运行依赖状态，请刷新检测。";
  } else s || (s = t ? t.enabled ? t.error ? `MCP 工具查询失败：${t.error}` : t.toolCount > 0 ? `依赖检测通过，MCP 服务已启用并发现 ${t.toolCount} 个已启用工具；具体函数以服务实际提供为准。` : "MCP 服务已启用，但未发现已启用的工具。" : "当前专家尚未启用该 MCP 服务。" : "未发现当前专家的 MCP 服务配置，或服务状态查询未成功。");
  return {
    definition: r,
    dependencyStatus: i,
    checkedAt: e.checked_at,
    effectiveStatus: a,
    statusDescription: s,
    discoveredToolCount: l,
    mcpProviderKey: o
  };
}
const lr = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  partial: "部分可用",
  error: "错误"
}, cr = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  partial: "warning",
  error: "error"
}, Te = (e, t, n, r) => ({ inputs: e, outputs: t, description: n, limitations: r }), Oi = {
  "welllog.las.read": Te(
    "path：LAS 文件路径；encoding：文件编码（默认自动）；sample_rows：首尾采样行数（默认 20，最大 200）。",
    "包含井/曲线元数据、曲线摘要、采样数据和 QC 警告的 JSON。",
    "读取 LAS 文件并返回元数据和采样行。"
  ),
  "welllog.quality.validate": Te(
    "path：LAS 文件路径；encoding：文件编码（默认自动）。",
    "包含通过/失败状态、错误、警告和逐项检查结果的 QC 报告 JSON。",
    "校验 LAS 文件质量。"
  ),
  "welllog.las.export": Te(
    "input_path：源 LAS 路径；output_path：目标 LAS 路径（须与源路径不同）；encoding：读写编码（默认 utf-8）。",
    "包含输出路径和工件引用的 JSON。",
    "规范化导出 .las 文件。",
    "仅支持 .las，输入和输出路径必须不同。"
  ),
  "production.decline.fit": Te(
    "time：相对时间数值数组；rate：对应产量数组；time_unit：时间单位（如 month/day/year）；rate_unit：产量单位（如 bbl/d、m3/d）；model：auto/exponential/harmonic/hyperbolic（默认 auto）。",
    "fits（各模型的 model/qi/di/b、RMSE、MAE、R²、AIC、fit_start、fit_end）、recommended、is_auto、warnings。",
    "对给定时间和产量数组拟合 Arps 递减曲线。",
    "time 与 rate 数组须一一对应。"
  ),
  "production.decline.forecast": Te(
    "model：exponential/harmonic/hyperbolic；qi：初始产量；di：初始递减率；b：双曲指数（双曲模型必需，其余忽略）；forecast_time：预测时间数组；time_unit、rate_unit：单位。",
    "result：model、qi、di、b、forecast（每项含 time、rate）；领域结果外层还含 units、metrics、assumptions、warnings、tolerances、applicability、provenance、artifacts。",
    "按递减模型参数预测指定时点产量。"
  ),
  "production.decline.eur": Te(
    "model、qi、di、b、time_unit、rate_unit；forecast_end：预测截止时间（可选）；economic_limit：经济极限产量（可选，二者按工具约束使用）。",
    "result：model、qi、di、b、effective_end、final_rate、cumulative_production、economic_limit_used、forecast_end_used；外层含 units、metrics、assumptions、warnings 等领域结果字段。",
    "按时间边界或经济极限估算最终采收量。"
  ),
  "fluid.flash": Te(
    "components：组分名到摩尔分数的映射；temperature：温度（默认单位 C）；pressure：压力（默认 bara）；temperature_unit（默认 C）、pressure_unit（默认 bara）、eos（默认 SRK）、flash_type（默认 TP）。",
    "NeqSim runFlash 返回值；集成不可用时返回 ok=false、error_type、message 等错误字段。",
    "调用已发现的 NeqSim runFlash 工具。",
    "需要工作区 NeqSim Driver 和服务端 runFlash 能力。"
  ),
  "fluid.pvt": Te(
    "specification：PVT 实验规格对象或 JSON 字符串，原样序列化为 pvtJson。",
    "NeqSim runPVT 返回值；失败时返回 ok=false、error_type、message 和可选 metadata。",
    "调用 NeqSim runPVT 实验。",
    "需工作区 NeqSim Driver 提供 runPVT。"
  ),
  "fluid.phase_envelope": Te(
    "components：组分名到摩尔分数的映射；eos：状态方程名称（默认 SRK）。",
    "NeqSim getPhaseEnvelope 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim getPhaseEnvelope。",
    "需工作区 NeqSim Driver 提供 getPhaseEnvelope。"
  ),
  "process.simulation": Te(
    "process：流程规格对象或 JSON 字符串，序列化后传给 processJson。",
    "NeqSim runProcess 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim runProcess 流程模拟。",
    "需工作区 NeqSim Driver 提供 runProcess。"
  ),
  "pipeline.flow": Te(
    "specification：管道规格对象或 JSON 字符串，序列化后传给 pipelineJson。",
    "NeqSim runPipeline 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim runPipeline 多相流计算。",
    "需工作区 NeqSim Driver 提供 runPipeline。"
  ),
  "math.symbolic": Te(
    "coefficients：按最高次项到常数项排列的系数数组；首项不得为 0，至少 2 项。",
    "所有实根和复根及计算状态/诊断。",
    "求解多项式的数值根。",
    "最高次数不超过 20。"
  ),
  "statistics.bayesian": Te(
    "observations：观测数值数组；prior_mean、prior_std：正态先验均值/标准差；observation_std：观测标准差；draws、tune：抽样数和调优步数；seed：随机种子。",
    "posterior_mean、posterior_std、credible_interval_95、sample_count。",
    "对正态均值模型执行贝叶斯估计。",
    "当前工具限定为正态均值估计模型。"
  ),
  "optimization.multi_objective": Te(
    "centers：二次目标中心点数组；bounds：各变量上下界；population_size、generations：种群规模和迭代代数；seed：随机种子。",
    "result：solutions（每项含 variables、objectives）及 solution_count。",
    "优化工具定义的多目标二次问题。",
    "目标函数形式固定为工具实现的二次模型。"
  ),
  "simulation.discrete_event": Te(
    "arrival_interval：到达间隔；service_time：服务时间；servers：服务台数量（默认 1，范围 1–100）；duration：仿真时长（默认 100，须为正；时间单位一致）。",
    "arrivals、completed、average_wait、maximum_wait、servers。",
    "模拟固定间隔到达、固定服务时长的 FIFO 队列。",
    "不计算利用率；到达间隔、服务时间和仿真时长须为正。"
  ),
  "graph.analysis": Te(
    "nodes：节点名称数组；edges：由起点、终点组成的边数组；directed：是否有向；source、target：路径查询端点（可为空）。",
    "节点/边统计、连通性及可用的路径分析结果。",
    "分析给定图结构。",
    "仅分析传入的图，不自动读取外部网络数据。"
  ),
  "geospatial.analysis": Te(
    "points：坐标数组，每项为 [x,y]；crs：输入坐标参考系（默认 EPSG:4326）。",
    "point_count、crs、bounds、centroid。",
    "对输入点集执行工具实现的空间分析。",
    "当前工具只接收点集，不能据此推断支持任意矢量处理。"
  ),
  "machine_learning.modeling": Te(
    "features：训练特征二维数组；targets：目标值数组；predict_features：待预测特征二维数组。",
    "coefficients、intercept、training_r_squared、training_rmse、predictions。",
    "执行工具实现的回归建模与预测。",
    "当前接口是回归任务，不代表 scikit-learn 的分类、聚类等全部能力。"
  ),
  "statistics.modeling": Te(
    "features：特征二维数组；targets：目标值数组；feature_names：特征名称数组。",
    "coefficients、standard_errors、p_values、r_squared、adjusted_r_squared、observation_count。",
    "执行工具实现的统计回归。",
    "当前接口限定于已实现的回归分析。"
  ),
  "units.convert": Te(
    "value：标量数值；from_unit、to_unit：源单位和目标单位字符串。",
    "标准领域计算结果，result 中包含 value、from_unit、to_unit；外层含 units 和 applicability。",
    "在 UGSci 显式单位表内换算标量。",
    "源单位和目标单位必须属于同一受支持物理量纲。"
  ),
  "reservoir.volumetrics.oil_in_place": Te(
    "area：面积；net_pay：净厚度；porosity、water_saturation：孔隙度/含水饱和度（比例）；oil_fvf：原油体积系数；area_unit（默认 acre）、length_unit（默认 ft）、output_unit（默认 stb）。",
    "OOIP 数值、输出单位及计算依据/输入摘要。",
    "容积法计算原始地质储量。"
  ),
  "reservoir.material_balance.oil": Te(
    "必填 produced_oil、initial_oil_fvf、current_oil_fvf、initial_pressure、current_pressure；可选 produced_gor、initial_solution_gor、current_solution_gor、gas_fvf、produced_water、water_fvf、water_influx、initial_water_saturation、water_compressibility、rock_compressibility；volume_unit（默认 stb）、pressure_unit（psi）、compressibility_unit（1/psi）。",
    "估算 OOIP、物质平衡各项及计算状态。",
    "按输入 PVT 和水侵/压缩项执行油藏物质平衡。",
    "未提供的可选项使用模型默认值；结果取决于输入 PVT 与单位的一致性。"
  ),
  "reservoir.material_balance.gas_pz": Te(
    "produced_gas、initial_pressure、initial_z_factor、current_pressure、current_z_factor；gas_volume_unit（默认 scf）、pressure_unit（默认 psi）。",
    "OGIP 估算及 p/z 计算量/状态。",
    "按 p/z 衰竭关系估算气藏原始地质储量。"
  ),
  "fluid.pvt.standing_black_oil": Te(
    "pressure、temperature、oil_api、gas_specific_gravity、solution_gor_at_bubble_point；pressure_unit（默认 psi）、temperature_unit（默认 F）、gor_unit（默认 scf/stb）。",
    "Standing 关联式计算的泡点压力、溶解气油比和油体积系数。",
    "计算本地黑油 PVT 近似性质。",
    "采用 Standing 关联式，不是通用状态方程或组分模拟。"
  ),
  "production.ipr.vogel": Te(
    "reservoir_pressure、test_flowing_pressure、test_rate；target_flowing_pressures：目标流压数组；pressure_unit（默认 psi）、rate_unit（默认 stb/d）。",
    "Vogel IPR 参数及各目标流压对应产能。",
    "基于测试点构建 Vogel 油井 IPR。"
  ),
  "production.nodal_analysis": Te(
    "reservoir_pressure、test_flowing_pressure、test_rate、wellhead_pressure、hydrostatic_pressure、friction_pressure_at_test_rate；pressure_unit（psi）、rate_unit（stb/d）；tolerance（默认 1e-6）、max_iterations（默认 100）。",
    "求得的工作点产量/压力、迭代状态及节点计算摘要。",
    "求解当前简化 IPR/VLP 交点。",
    "VLP 由提供的压力项和工具模型表示，不替代完整多相管流模拟。"
  ),
  "validation.conservation_check": Te(
    "initial_inventory、final_inventory：期初/期末库存；inflows、outflows：流入/流出数值数组；tolerance（默认 1e-6）；unit（默认 rb）。",
    "闭合误差、相对误差、是否在容差内及各项汇总。",
    "检查给定边界的质量/体积守恒。"
  ),
  "storage.inventory.accounting": Te(
    "initial_inventory、cumulative_injected、cumulative_produced：库存及累计注采量；gas_volume_unit（默认 1e8_sm3）。",
    "期末账面库存、注采平衡量及校核信息。",
    "按统一体积单位执行库存计量平衡。"
  ),
  "storage.inventory.effective_controlled": Te(
    "layers：分层数组，每层含 name、produced_gas、injection_end_pressure、injection_end_z、evaluation_pressure、evaluation_z；cycle_id、injection_end_state_id、evaluation_state_id；gas_volume_unit（1e8_sm3）、pressure_unit（MPa）、pressure_basis（absolute/apparent_formation/report_defined）；可选 denominator_relative_tolerance、maximum_inverse_withdrawal_fraction。",
    "result：effective_inventory、layers（逐层 name、produced_gas、injection_end_p_over_z、evaluation_p_over_z、p_over_z_depletion、withdrawal_fraction、inverse_withdrawal_fraction、effective_inventory）、cycle_id、injection_end_state_id、evaluation_state_id、pressure_basis、equation、quantity_definition、quality_gate；外层含 units、metrics、assumptions、warnings、applicability。",
    "按分层 p/Z 采气段公式计算有效控制库存。",
    "依赖输入压力基准与 Z 值；异常分母或超限反向采气比例会触发校验。"
  ),
  "storage.inventory.evaluate": Te(
    "layers：分层数组，每层含 name、produced_gas、injection_end_pressure、injection_end_z、evaluation_pressure、evaluation_z；cycle_id、injection_end_state_id、evaluation_state_id、design_capacity 必填；book_inventory 与 initial_inventory/cumulative_injected/cumulative_produced 二选一；working_gas 与 design_working_gas 成对可选；peak_daily_rate 与 design_peak_daily_rate 成对可选；gas_volume_unit（默认 1e8_sm3）、pressure_unit（默认 MPa）、pressure_basis（默认 absolute；可选 apparent_formation/report_defined）、daily_rate_unit（默认 1e4_sm3/d）。",
    "effective_inventory、book_inventory、book_minus_effective_inventory、effective_minus_book_percent、design_capacity、effective_inventory_design_compliance_percent、book_inventory_fill_percent、effective_to_book_percent、book_inventory_source、review_status、review_reference、layers、quantity_separation、quality_gate；按输入条件附加 book_inventory_accounting、working_gas/design_working_gas/working_gas_compliance_percent、peak_daily_rate/design_peak_daily_rate/peak_daily_compliance_percent。",
    "分离计算账面库存、有效控制库存及可选工作气/冲峰指标，并标记待审核。",
    "结果始终为待审核计算建议，不表示已审批。"
  ),
  "storage.capacity.evaluate": Te(
    "layers：每层 name、pore_volume、maximum_pressure、maximum_z、minimum_pressure、minimum_z、temperature；pore_volume_unit（m3）、pressure_unit（MPa）、temperature_unit（K）；standard_pressure（默认 0.101325）、standard_temperature（默认 288.15）、gas_volume_unit（1e8_sm3）。",
    "result：total_capacity、cushion_gas、working_gas、working_gas_fraction、layers（逐层 maximum_capacity/minimum_inventory/working_gas 等）、pressure_window、method、review_status、review_reference；外层含 units、metrics、assumptions、warnings、applicability。",
    "按孔隙体积和压力/Z 边界换算标准气量。",
    "属于边界筛选；不包含水侵、地质力学或产能能力模型。"
  ),
  "storage.injection_allocation.optimize": Te(
    "wells：井组数组，含 name、maximum_rate、可选 minimum_rate（默认 0）、weight（默认 1）、available（默认 true）；target_rate；rate_unit（1e4_sm3/d）；require_feasible（默认 false）。",
    "目标/请求量、分配总量、未满足量、超配量、feasible、逐井 allocated_rate/constraint_status、method、review_status；并附单位、井数指标、假设、警告和适用范围。",
    "按可用井的最低量和权重上限填充分配目标。",
    "不计算井筒/地层物理响应；结果是边界内的分配方案。"
  ),
  "storage.production_allocation.optimize": Te(
    "wells：井组数组，含 name、maximum_rate、可选 minimum_rate（默认 0）、weight（默认 1）、available（默认 true）；demand_rate；rate_unit（1e4_sm3/d）；require_feasible（默认 false）。",
    "需求/请求量、分配总量、未满足量、超配量、feasible、逐井 allocated_rate/constraint_status、method、review_status；并附单位、井数指标、假设、警告和适用范围。",
    "按可用井的最低量和权重上限填充分配需求。",
    "井组产能上下限由调用方提供；工具不计算井筒或地层产能。"
  ),
  "storage.scenario.optimize": Te(
    "scenarios：候选数组，每项含 name、metrics（指标名到数值），metadata（可选字符串映射）；objectives：指标 key、direction（maximize/minimize）、weight；constraints（可选，key/operator/limit）；metric_unit（可选）。",
    "可行方案排序、目标评分、约束筛选与非支配 Pareto 方案。",
    "按显式目标和约束做透明方案比较。",
    "仅比较提供的标量指标，不运行储层仿真。"
  ),
  "visualization.open": Te(
    "dataset_id：数据集标识（默认空字符串，表示不指定数据集）。",
    "排队命令回执：kind、commandId、command=open、datasetId；配置/队列异常时返回 kind=error 和 error。",
    "请求打开三维查看器并可选加载数据集。"
  ),
  "visualization.property": Te(
    "property：属性名；dataset_id：数据集标识（默认空字符串）。",
    "排队命令回执：kind、commandId、command=set-property、property；异常时 kind=error/error。",
    "向查看器发送属性着色切换命令。"
  ),
  "visualization.benchmark": Te(
    "无参数。",
    "排队基准命令回执：kind、commandId、command=benchmark；实际基准数据需查询/由查看器执行。",
    "请求查看器运行五秒渲染基准。"
  ),
  "storage.history.import": Te(
    "input_path：本地文件或目录的路径。",
    "ok、dataset_id、records、facilities、quality_counts、quality_examples（最多 20 条）、source_columns、reused。",
    "导入本地储气库注采历史数据并检查质量。",
    "接受 XLS/XLSX/UTF-8 CSV 文件或目录；原件保留。"
  ),
  "storage.dynamics.analyze": Te(
    "dataset_id：数据集 ID；facility、well：储气库/井原名（默认空，表示全部）；start、end：YYYY-MM-DD 起止日期（默认空，取全范围）；cycle_start_month：气年度起始月 1–12（默认 4）；drop_threshold_pct：同阶段末 7 日与前 7 日折算量下降筛查阈值百分比（默认 30）。",
    "ok、summary、coverage、cycles_recent、anomalies、forecast_wells、warnings、parameters、quality_counts、quality_examples、report_path、analysis_path。",
    "生成并保存可追溯的储气库动态分析报告。"
  ),
  "storage.history.list": Te(
    "无参数。",
    "ok、datasets（每项含 id、name、records、facilities、quality_counts、quality_examples）及 quality_code_meaning。",
    "列出已导入储气库历史数据集。"
  )
}, Qt = {
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
function Mi(e) {
  const t = Oi[e.id];
  return {
    description: (t == null ? void 0 : t.description) || e.description || "暂无说明",
    inputs: (t == null ? void 0 : t.inputs) || "输入信息未提供",
    outputs: (t == null ? void 0 : t.outputs) || "输出信息未提供",
    limitations: t == null ? void 0 : t.limitations
  };
}
function Li({
  operations: e
}) {
  const t = P().React, { Tag: n, Typography: r } = P().antd, { Text: i } = r;
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 8, minWidth: 0 } },
    ...e.map((a) => {
      const s = Mi(a);
      return t.createElement(
        "div",
        {
          key: a.id,
          style: {
            padding: "10px 12px",
            border: "1px solid var(--app-border-subtle, #f0f0f0)",
            borderRadius: 6,
            minWidth: 0
          }
        },
        t.createElement(
          i,
          { strong: !0, style: { overflowWrap: "anywhere" } },
          a.name
        ),
        t.createElement(
          i,
          {
            type: "secondary",
            style: { display: "block", fontSize: 11, overflowWrap: "anywhere" }
          },
          a.tool_names.length ? `工具：${a.tool_names.join("、")}` : "工具：未声明"
        ),
        t.createElement(
          i,
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
          i,
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
          i,
          {
            type: "secondary",
            style: { display: "block", fontSize: 12, overflowWrap: "anywhere" }
          },
          `输出：${s.outputs}`
        ),
        s.limitations ? t.createElement(
          i,
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
        Oi[a.id] ? null : t.createElement(
          n,
          { style: { marginTop: 4 } },
          "详细说明待补充"
        )
      );
    })
  );
}
const jl = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  reservoir_engineering: "🛢️",
  underground_gas_storage: "🛢️",
  gas_storage: "🛢️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
};
function Nl({
  view: e,
  onDetails: t,
  onInstall: n,
  onConfigure: r,
  onRefresh: i,
  installTask: a
}) {
  const s = P().React, { Card: l, Tag: o, Typography: d, Button: c, Modal: m, Tooltip: u } = P().antd, { Text: p } = d, [E, h] = s.useState(!1), y = e.definition, g = Qt[y.id], f = (a == null ? void 0 : a.status) === "queued" || (a == null ? void 0 : a.status) === "running", x = y.id !== "neqsim" && e.effectiveStatus === "unavailable" && y.dependencies.length > 0 && y.dependencies.every((k) => !/(three\.js|java|neqsim)/i.test(k)), v = f ? { label: "查看安装进度", action: n, disabled: !1 } : y.id === "neqsim" && e.effectiveStatus === "needs_install" ? {
    label: "安装 NeqSim 运行环境",
    action: n,
    disabled: !1
  } : e.effectiveStatus === "needs_install" || x ? {
    label: "安装运行环境",
    action: n,
    disabled: !1
  } : e.effectiveStatus === "unconfigured" || e.effectiveStatus === "partial" ? { label: "启用工具", action: r, disabled: !1 } : e.effectiveStatus === "error" || e.effectiveStatus === "unknown" ? { label: "重新检测", action: i, disabled: !1 } : null;
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
        jl[y.domain] || "📦"
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
          y.name
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
                color: cr[e.effectiveStatus] || "default",
                tabIndex: 0
              },
              lr[e.effectiveStatus] || e.effectiveStatus
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
      (g == null ? void 0 : g.description) || y.description || "暂无领域说明"
    ),
    a && f ? s.createElement(
      p,
      {
        type: "secondary",
        role: "status",
        style: { marginTop: 8, fontSize: 12, lineHeight: "18px" }
      },
      a.message || "运行环境安装中…"
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
          "aria-label": `查看 ${y.name} 的函数`,
          onClick: () => h(!0)
        },
        `查看函数 · ${y.operations.length}`
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
            "aria-label": `查看 ${y.name} 详情`,
            onClick: t
          },
          "查看详情"
        )
      )
    ),
    s.createElement(
      m,
      {
        title: `${y.name} · 函数说明`,
        open: E,
        onCancel: () => h(!1),
        width: "min(720px, calc(100vw - 32px))",
        destroyOnHidden: !0,
        footer: s.createElement(
          c,
          {
            onClick: () => h(!1),
            "aria-label": "关闭函数说明"
          },
          "关闭"
        ),
        styles: { body: { maxHeight: "65vh", overflowY: "auto" } }
      },
      s.createElement(Li, { operations: y.operations })
    )
  );
}
const Cn = [
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
function dr(e, t) {
  return t === "reservoir-visualization" ? Cn[2] : Cn.find((n) => n.domains.includes(e)) || Cn[5];
}
function Ul({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: i,
  onNavigateToSkills: a,
  onInstallNeqsim: s,
  neqsimInstallState: l
}) {
  const o = P().React, { Descriptions: d, Tag: c, Typography: m, Button: u, Divider: p } = P().antd, { Text: E, Paragraph: h } = m;
  if (!e) return null;
  const y = e.definition, g = e.dependencyStatus, f = Qt[y.id], x = dr(y.domain, y.id).title;
  return o.createElement(
    sn,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, y.name),
        o.createElement(
          c,
          {
            color: cr[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          lr[e.effectiveStatus] || e.effectiveStatus
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
      o.createElement(d.Item, { label: "领域" }, x),
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
        y.provider.kind === "driver" ? "内置能力 · MCP Driver" : y.source === "builtin" ? "内置工具" : y.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      o.createElement(
        d.Item,
        { label: "实现" },
        `${y.provider.kind}:${y.provider.id}`
      ),
      o.createElement(
        d.Item,
        { label: "计算类别" },
        y.execution_class === "deterministic" ? "确定性计算" : y.execution_class === "stochastic" ? "随机/概率计算" : y.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      o.createElement(
        d.Item,
        { label: "内核版本" },
        y.engine_version
      ),
      o.createElement(
        d.Item,
        { label: "描述" },
        (f == null ? void 0 : f.description) || y.description || "暂无领域说明"
      ),
      o.createElement(
        d.Item,
        { label: "总输入" },
        (f == null ? void 0 : f.inputs) || "输入信息未提供"
      ),
      o.createElement(
        d.Item,
        { label: "总输出" },
        (f == null ? void 0 : f.outputs) || "输出信息未提供"
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
      o.createElement(E, { strong: !0 }, "领域操作")
    ),
    o.createElement(Li, { operations: y.operations }),
    o.createElement(
      "div",
      { style: { marginTop: 16, display: "flex", gap: 4, flexWrap: "wrap" } },
      ...y.tags.map(
        (v) => o.createElement(c, { key: v, color: "cyan" }, v)
      )
    ),
    // Dependencies
    o.createElement(p, null),
    o.createElement(E, { strong: !0 }, "实现与依赖"),
    g && g.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...g.dependencies.map(
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
              E,
              { style: { fontSize: 13 } },
              v.name
            ),
            o.createElement(
              c,
              {
                color: cr[v.status] || "default",
                style: { fontSize: 11 }
              },
              lr[v.status] || v.status
            )
          ),
          v.status !== "available" && v.reason ? o.createElement(
            E,
            {
              type: "secondary",
              style: { display: "block", fontSize: 12, marginTop: 4 }
            },
            v.reason
          ) : null,
          v.status !== "available" && v.install_hint ? o.createElement(
            E,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${v.install_hint}`
          ) : null,
          v.status !== "available" && v.enable_hint ? o.createElement(
            E,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${v.enable_hint}`
          ) : null
        )
      )
    ) : o.createElement(
      h,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(p, null),
    o.createElement(E, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      y.id === "neqsim" && e.effectiveStatus === "needs_install" ? o.createElement(
        u,
        {
          size: "small",
          type: "primary",
          loading: (l == null ? void 0 : l.status) === "queued" || (l == null ? void 0 : l.status) === "running",
          onClick: s
        },
        (l == null ? void 0 : l.status) === "running" ? `${l.message} (${l.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      y.provider.kind === "driver" ? o.createElement(
        u,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : y.source === "library" ? o.createElement(
        u,
        { size: "small", onClick: a },
        "查看相关技能"
      ) : o.createElement(
        u,
        { size: "small", onClick: () => i("builtin") },
        "查看内置工具"
      )
    ),
    y.id === "neqsim" && (l == null ? void 0 : l.status) === "failed" ? o.createElement(
      h,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      l.error || "安装失败"
    ) : null,
    y.id === "neqsim" && (l != null && l.warning) ? o.createElement(
      h,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      l.warning
    ) : null
  );
}
function Dl({
  open: e,
  engineName: t,
  plan: n,
  task: r,
  error: i,
  onClose: a,
  onTaskChange: s,
  onRetry: l,
  onCompleted: o,
  onManage: d
}) {
  const c = P().React, { Modal: m, Button: u, Typography: p, Alert: E, Progress: h, Tag: y, Space: g } = P().antd, { Text: f, Paragraph: x } = p, v = c.useRef(0), k = c.useRef(!0), M = `${e}:${(n == null ? void 0 : n.engine_id) || ""}`, z = c.useRef(M);
  z.current = M;
  const [A, T] = c.useState(!1), [F, G] = c.useState(""), [_, $] = c.useState(0), I = (r == null ? void 0 : r.status) === "queued" || (r == null ? void 0 : r.status) === "running";
  c.useEffect(() => {
    T(!1), G("");
  }, [M]), c.useEffect(() => (k.current = !0, () => {
    k.current = !1, v.current += 1;
  }), []), c.useEffect(() => {
    if (!e || !I || !r) return;
    const N = ++v.current;
    let J = !1;
    return (async () => {
      for (; !J && N === v.current; ) {
        if (await new Promise((O) => setTimeout(O, 1e3)), J || N !== v.current) return;
        try {
          const O = await Ol(r.id);
          if (J || N !== v.current) return;
          if (G(""), s(O), O.status === "completed") {
            o();
            return;
          }
          if (O.status === "failed") return;
        } catch (O) {
          if (J || N !== v.current) return;
          const K = O instanceof Error ? O.message : "连接安装任务失败";
          if (/HTTP 404|not found|未找到/i.test(K))
            try {
              const U = await or(r.engine_id);
              if (J || N !== v.current) return;
              U.state === "ready" ? (s({
                ...r,
                status: "completed",
                progress: 100,
                message: "依赖已就绪，已恢复安装状态。",
                error: ""
              }), o()) : U.active_task ? (s(U.active_task), $((ie) => ie + 1)) : s({
                ...r,
                status: "failed",
                error: "未找到此安装任务，且依赖尚未就绪，请重新发起安装。"
              });
            } catch {
              if (J || N !== v.current) return;
              G("暂时无法确认安装结果，请重新检测以恢复进度。");
            }
          else
            G(
              `连接安装任务时遇到问题。安装可能仍在后台继续，请重新检测以恢复进度。（${K}）`
            );
          return;
        }
      }
    })(), () => {
      J = !0, v.current += 1;
    };
  }, [e, I, r == null ? void 0 : r.id, _, s, o]);
  const R = async () => {
    if (!(n != null && n.installable) || A || I) return;
    const N = z.current;
    T(!0);
    try {
      const J = await Pl(n.engine_id);
      if (!k.current || z.current !== N) return;
      s(J), J.status === "completed" && o();
    } catch (J) {
      if (!k.current || z.current !== N) return;
      l(J instanceof Error ? J.message : "无法开始安装，请重试");
    } finally {
      k.current && z.current === N && T(!1);
    }
  }, S = !!(n != null && n.installable) && !I && (r == null ? void 0 : r.status) !== "completed", j = (r == null ? void 0 : r.status) === "completed", q = (r == null ? void 0 : r.status) === "failed", L = j ? c.createElement(E, {
    type: "success",
    showIcon: !0,
    message: "安装完成",
    description: (r == null ? void 0 : r.message) || "运行环境安装完成。请关闭弹窗查看刷新后的工具状态。"
  }) : q ? c.createElement(E, {
    type: "error",
    showIcon: !0,
    message: "安装失败",
    description: (r == null ? void 0 : r.error) || (r == null ? void 0 : r.message) || "安装失败，请重试。"
  }) : r ? c.createElement(
    "div",
    { role: "status", "aria-live": "polite", style: { marginTop: 16 } },
    c.createElement(
      g,
      { size: 8 },
      c.createElement(
        y,
        { color: I ? "processing" : "default" },
        r.status === "queued" ? "排队中" : r.status === "running" ? "安装中" : r.status
      ),
      c.createElement(f, null, r.message || "正在准备安装…")
    ),
    I ? c.createElement(
      c.Fragment,
      null,
      c.createElement(
        f,
        {
          type: "secondary",
          style: { display: "block", marginTop: 8, fontSize: 12 }
        },
        "阶段进度（非下载百分比）"
      ),
      c.createElement(h, {
        percent: r.progress ?? void 0,
        status: "active",
        showInfo: !1,
        style: { marginTop: 2, marginBottom: 0 }
      })
    ) : null,
    r.warning ? c.createElement(E, {
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
      onCancel: a,
      width: "min(520px, calc(100vw - 32px))",
      destroyOnHidden: !1,
      footer: j ? c.createElement(
        u,
        {
          type: "primary",
          onClick: a,
          "aria-label": "关闭安装完成提示"
        },
        "关闭"
      ) : q ? c.createElement(
        g,
        null,
        c.createElement(u, { onClick: a }, "关闭"),
        c.createElement(
          u,
          {
            type: "primary",
            onClick: R,
            disabled: !(n != null && n.installable),
            loading: A,
            "aria-label": "重试安装"
          },
          "重试安装"
        )
      ) : r ? c.createElement(
        u,
        { onClick: a, "aria-label": "关闭安装进度" },
        "后台继续，关闭窗口"
      ) : n && !n.installable && n.state !== "ready" ? c.createElement(
        c.Fragment,
        null,
        c.createElement(u, { onClick: a }, "关闭"),
        c.createElement(
          u,
          { onClick: d, "aria-label": "前往工具或技能管理入口" },
          "前往管理入口"
        )
      ) : (n == null ? void 0 : n.state) === "ready" ? c.createElement(
        u,
        { type: "primary", onClick: a },
        "关闭"
      ) : c.createElement(
        g,
        null,
        c.createElement(u, { onClick: a }, "取消"),
        c.createElement(
          u,
          {
            type: "primary",
            disabled: !S || A,
            loading: A,
            onClick: R,
            "aria-label": "开始安装运行环境"
          },
          "开始安装"
        )
      )
    },
    i ? c.createElement(E, {
      type: "error",
      showIcon: !0,
      message: "运行环境操作未完成",
      description: i,
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
    F ? c.createElement(E, {
      style: { marginTop: 12 },
      type: "warning",
      showIcon: !0,
      message: F,
      action: c.createElement(
        u,
        {
          size: "small",
          onClick: () => {
            G(""), $((N) => N + 1), l();
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
        x,
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
          f,
          {
            strong: !0,
            style: { display: "block", marginBottom: 6 }
          },
          "依赖清单"
        ),
        ...n.packages.map(
          (N) => c.createElement(
            "div",
            {
              key: N,
              style: {
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: "21px",
                overflowWrap: "anywhere"
              }
            },
            N
          )
        )
      ) : c.createElement(E, {
        type: n.installable ? "info" : "warning",
        showIcon: !0,
        message: n.message || "没有可列出的安装依赖。"
      }),
      j || n.state === "ready" ? c.createElement(E, {
        style: { marginTop: 12 },
        type: "success",
        showIcon: !0,
        message: "运行环境已就绪"
      }) : null,
      !n.installable && n.state !== "ready" ? c.createElement(E, {
        style: { marginTop: 12 },
        type: "warning",
        showIcon: !0,
        message: n.message || "当前环境不支持自动安装，请前往工具或技能管理入口处理。"
      }) : null
    ) : null,
    L
  );
}
function Fl(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function Gl({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var ye, we;
  const r = P().React, { useState: i, useEffect: a, useCallback: s, useMemo: l, useRef: o } = r, {
    Spin: d,
    Empty: c,
    Button: m,
    message: u,
    Row: p,
    Col: E,
    Input: h
  } = P().antd, { ReloadOutlined: y, SearchOutlined: g } = P().antdIcons || {}, f = (we = (ye = P()).useSelectedAgent) == null ? void 0 : we.call(ye), x = (f == null ? void 0 : f.id) || "default", [v, k] = i([]), [M, z] = i(!0), [A, T] = i(""), [F, G] = i(!1), [_, $] = i(null), [I, R] = i({ general: !0 }), [S, j] = i(null), [q, L] = i(null), [N, J] = i(
    null
  ), [B, O] = i(
    null
  ), [K, U] = i(""), [ie, ue] = i(!1), le = o(x);
  le.current = x;
  const ae = o(_);
  ae.current = _;
  const Q = o(0), W = o(0);
  a(
    () => () => {
      Q.current += 1, W.current += 1;
    },
    []
  );
  const ee = s(async (b = !1, V = !1) => {
    var Z, he;
    V || z(!0);
    const C = V && typeof window < "u" ? {
      x: window.scrollX,
      y: window.scrollY,
      drawerBody: typeof document < "u" ? document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      ) : null,
      drawerTop: typeof document < "u" && ((Z = document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      )) == null ? void 0 : Z.scrollTop) || 0
    } : null, re = () => {
      if (!C || typeof window > "u") return;
      const xe = () => {
        var Ie;
        window.scrollTo(C.x, C.y), (Ie = C.drawerBody) != null && Ie.isConnected && (C.drawerBody.scrollTop = C.drawerTop);
      };
      typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(xe) : xe();
    }, ge = le.current;
    try {
      const [xe, Ie, Ge] = await Promise.all([
        $l(b),
        Ll(ge, b),
        Ml(ge, b)
      ]);
      if (ge !== le.current) return;
      const qe = [];
      for (const Ye of xe)
        try {
          let H = null;
          if (Ye.engine.provider.kind === "driver") {
            const Ee = Ye.engine.provider.id;
            H = Ie.get(Ee) || null;
          }
          qe.push(Bl(Ye, H, Ge));
        } catch {
        }
      k(qe);
      const rt = (he = ae.current) == null ? void 0 : he.definition.id;
      if (rt) {
        const Ye = qe.find((H) => H.definition.id === rt);
        Ye && (ae.current = Ye, $(Ye));
      }
      re();
    } catch (xe) {
      const Ie = xe instanceof Error ? xe.message : "加载领域引擎失败";
      u.error(Ie), V || k([]);
    } finally {
      V || z(!1);
    }
  }, []);
  a(() => {
    ee();
  }, [x, ee]);
  const X = l(() => {
    if (!A.trim()) return v;
    const b = A.trim().toLowerCase();
    return v.filter(
      (V) => {
        var C, re, ge;
        return dr(V.definition.domain, V.definition.id).title.toLowerCase().includes(b) || V.definition.name.toLowerCase().includes(b) || V.definition.domain.toLowerCase().includes(b) || V.definition.description.toLowerCase().includes(b) || [
          ((C = Qt[V.definition.id]) == null ? void 0 : C.description) || "",
          ((re = Qt[V.definition.id]) == null ? void 0 : re.inputs) || "",
          ((ge = Qt[V.definition.id]) == null ? void 0 : ge.outputs) || ""
        ].some((Z) => Z.toLowerCase().includes(b)) || V.definition.tags.some((Z) => Z.toLowerCase().includes(b)) || V.definition.operations.some((Z) => {
          const he = Mi(Z);
          return [
            Z.name,
            Z.id,
            Z.description,
            ...Z.tool_names,
            he.description,
            he.inputs,
            he.outputs,
            he.limitations || ""
          ].some((xe) => xe.toLowerCase().includes(b));
        });
      }
    );
  }, [v, A]), D = l(
    () => Cn.map((b) => ({
      ...b,
      views: X.filter(
        (V) => dr(V.definition.domain, V.definition.id).key === b.key
      )
    })).filter((b) => b.views.length > 0),
    [X]
  ), me = s(() => {
    ee(!0);
  }, [ee]), ve = s((b) => {
    ae.current = b, $(b), G(!0);
  }, []), de = s(() => {
    G(!1), e == null || e();
  }, [e]), Y = s(
    (b) => {
      G(!1), t == null || t(b);
    },
    [t]
  ), be = s(() => {
    G(!1), n == null || n();
  }, [n]), ke = s(async () => {
    if ((S == null ? void 0 : S.status) === "queued" || (S == null ? void 0 : S.status) === "running")
      return;
    const b = ++Q.current, V = () => b === Q.current;
    try {
      let C = await zl();
      if (!V()) return;
      for (j(C); C.status === "queued" || C.status === "running"; ) {
        if (await new Promise((re) => setTimeout(re, 1e3)), !V()) return;
        try {
          C = await Rl(C.id);
        } catch (re) {
          if (!Fl(re)) throw re;
          const ge = await Al(!0);
          if (!V()) return;
          ge.ready ? C = {
            ...C,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: ge,
            recovered: !0
          } : C = {
            ...C,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: ge,
            recovered: !0
          };
        }
        if (!V()) return;
        j(C);
      }
      if (!V()) return;
      C.status === "completed" ? (C.warning ? u.warning(C.warning) : u.success("NeqSim 运行环境已安装并启用"), await ee(!0, !0)) : u.error(C.error || "NeqSim 安装失败");
    } catch (C) {
      if (!V()) return;
      u.error(C instanceof Error ? C.message : "NeqSim 安装失败");
    }
  }, [ee, S]), Ae = s(
    async (b) => {
      if (b.definition.id === "neqsim") {
        (S == null ? void 0 : S.status) === "queued" || (S == null ? void 0 : S.status) === "running" ? (ae.current = b, $(b), G(!0)) : ke();
        return;
      }
      L(b), J(null), O(null), U(""), ue(!0);
      const V = ++W.current;
      try {
        const C = await or(b.definition.id);
        if (V !== W.current) return;
        J(C), O(C.active_task);
      } catch (C) {
        if (V !== W.current) return;
        U(
          C instanceof Error ? C.message : "读取运行环境失败"
        );
      }
    },
    [ke, S]
  ), Re = s(
    async (b) => {
      if (b) {
        U(b);
        return;
      }
      if (!q) return;
      U("");
      const V = ++W.current;
      try {
        const C = await or(
          q.definition.id
        );
        if (V !== W.current) return;
        J(C), O(C.active_task);
      } catch (C) {
        if (V !== W.current) return;
        U(
          C instanceof Error ? C.message : "读取运行环境失败"
        );
      }
    },
    [q]
  ), Se = s(() => {
    ee(!0, !0);
  }, [ee]), fe = s(
    (b) => {
      b.definition.provider.kind === "driver" || b.definition.source === "mcp" ? de() : b.definition.source === "library" || b.definition.provider.kind === "skill" ? be() : Y("builtin");
    },
    [de, be, Y]
  );
  return r.createElement(
    "div",
    { className: "ugsci-capability-section", "data-focused": F },
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
      r.createElement(h, {
        placeholder: "搜索领域引擎...",
        prefix: g ? r.createElement(g) : void 0,
        value: A,
        onChange: (b) => {
          const V = b.target.value;
          T(V), R(V.trim() ? {} : { general: !0 });
        },
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        m,
        {
          icon: y ? r.createElement(y) : void 0,
          onClick: me,
          loading: M
        },
        "刷新"
      )
    ),
    // Content
    M ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(d, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : X.length === 0 ? r.createElement(c, {
      description: A ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...D.map((b) => {
        const V = !!I[b.key];
        return r.createElement(
          "div",
          { key: b.key, style: { marginBottom: 20 } },
          r.createElement(
            m,
            {
              type: "text",
              onClick: () => R((C) => ({
                ...C,
                [b.key]: !C[b.key]
              })),
              "aria-expanded": !V,
              style: {
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 8,
                paddingInline: 0
              }
            },
            `${V ? "▸" : "▾"} ${b.title} (${b.views.length})`
          ),
          V ? null : r.createElement(
            p,
            { gutter: [12, 12], align: "top" },
            ...b.views.map(
              (C) => r.createElement(
                E,
                {
                  key: C.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 12,
                  lg: 12,
                  style: { display: "flex", minWidth: 0 }
                },
                r.createElement(Nl, {
                  view: C,
                  onDetails: () => ve(C),
                  onInstall: () => void Ae(C),
                  onConfigure: () => fe(C),
                  onRefresh: () => void ee(!0),
                  installTask: C.definition.id === "neqsim" ? S ? {
                    id: S.id,
                    engine_id: "neqsim",
                    status: S.status,
                    progress: S.progress,
                    message: S.message,
                    error: S.error,
                    warning: S.warning
                  } : null : (q == null ? void 0 : q.definition.id) === C.definition.id ? B : null
                })
              )
            )
          )
        );
      })
    ),
    // Detail drawer
    r.createElement(Ul, {
      view: _,
      open: F,
      onClose: () => G(!1),
      onNavigateToMcp: de,
      onNavigateToTools: Y,
      onNavigateToSkills: be,
      onInstallNeqsim: ke,
      neqsimInstallState: S
    }),
    r.createElement(Dl, {
      open: ie,
      engineName: (q == null ? void 0 : q.definition.name) || "领域引擎",
      plan: N,
      task: B,
      error: K,
      onClose: () => {
        W.current += 1, ue(!1);
      },
      onTaskChange: O,
      onRetry: Re,
      onCompleted: Se,
      onManage: () => {
        W.current += 1, ue(!1), q && fe(q);
      }
    })
  );
}
const Wl = wl, Bi = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function ql(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Bi.has(t) ? t : e;
  } catch {
    return e;
  }
}
function Ta(e) {
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
function ur({ page: e }) {
  const t = P().React, { useEffect: n, useState: r } = t, { Alert: i, Spin: a } = P().antd, [s, l] = r(null), [o, d] = r("");
  if (n(() => {
    let m = !0;
    const u = P().loadBuiltinPage;
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
    return t.createElement(i, {
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
        a,
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
function Hl({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const n = P().React, { Tabs: r } = P().antd;
  return n.createElement(r, {
    activeKey: e,
    onChange: t,
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: n.createElement(ur, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置工具",
        children: n.createElement(ur, { page: "tools" })
      }
    ]
  });
}
function Jl({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  const r = P().React, { Tabs: i } = P().antd;
  return r.createElement(i, {
    defaultActiveKey: "simulation",
    className: "ugsci-engine-tabs",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: r.createElement(Il)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          Gl,
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
        children: r.createElement(ur, { page: "acp" })
      }
    ]
  });
}
function ji({
  initialTab: e = "engines"
} = {}) {
  var x, v;
  const t = P().React, { useEffect: n, useState: r } = t, { Tabs: i, Select: a } = P().antd, { RocketOutlined: s, ToolOutlined: l, ThunderboltOutlined: o } = P().antdIcons || {}, d = (v = (x = P()).useSelectedAgent) == null ? void 0 : v.call(x), c = (d == null ? void 0 : d.id) || "default", [m, u] = r([]);
  n(() => {
    let k = !0;
    return pn().then((M) => {
      k && u(M);
    }).catch(() => {
    }), () => {
      k = !1;
    };
  }, []);
  const [p, E] = r(
    () => ql(e)
  ), [h, y] = r("mcp");
  n(() => {
    try {
      const k = new URLSearchParams(window.location.search).get("tab");
      k && !Bi.has(k) && Ta(p);
    } catch {
    }
  }, [p]);
  const g = (k) => {
    E(k), Ta(k);
  }, f = (k, M) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    M ? t.createElement(M, { style: { fontSize: 14 } }) : null,
    k
  );
  return t.createElement(
    "div",
    { className: "ugsci-capabilities" },
    t.createElement("style", null, El),
    t.createElement(Bn, {
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
      t.createElement(a, {
        id: "ugsci-capability-agent",
        "aria-label": "配置对象",
        value: c,
        style: { minWidth: 180, maxWidth: "100%" },
        options: m.length ? m.map((k) => ({
          value: k.id,
          label: k.name || k.id
        })) : [{ value: c, label: c }],
        onChange: (k) => {
          var M, z;
          return (z = (M = P()).setSelectedAgent) == null ? void 0 : z.call(M, k);
        }
      })
    ),
    t.createElement(i, {
      activeKey: p,
      onChange: (k) => g(k),
      items: [
        {
          key: "engines",
          label: f("计算引擎", s),
          children: t.createElement(
            Jl,
            {
              onNavigateToMcp: () => {
                y("mcp"), g("tools");
              },
              onNavigateToTools: (k) => {
                y(k || "mcp"), g("tools");
              },
              onNavigateToSkills: () => g("skills")
            }
          )
        },
        {
          key: "tools",
          label: f("工具", l),
          children: t.createElement(Hl, {
            activeSubTab: h,
            onSubTabChange: y
          })
        },
        {
          key: "skills",
          label: f("技能", o),
          children: t.createElement(Wl, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Ni = ji;
function Vl() {
  return P().React.createElement(Ni, {
    initialTab: "tools"
  });
}
function Kl() {
  return P().React.createElement(Ni, {
    initialTab: "skills"
  });
}
function bt(e) {
  if (e)
    try {
      const t = new URL(e);
      if (t.username || t.password) return;
      if (t.protocol === "https:" || t.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(t.hostname))
        return t.href;
    } catch {
    }
}
function Xl(e, t = !1) {
  const n = String(e || "").trim().toLowerCase().replace(/[-_]/g, "");
  if (n === "sse") return "sse";
  if (n === "stdio") return "stdio";
  if (n === "streamablehttp" || n === "http" || !n && t)
    return "streamable_http";
  if (!n) return "stdio";
  throw new Error("不支持的 MCP 连接方式，请检查目录配置");
}
function Yl(e) {
  return [
    ...new Set(
      [
        ...JSON.stringify(e).matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)
      ].map((t) => t[1])
    )
  ];
}
function Ql(e, t) {
  const n = (a, s = !1) => a.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (l, o) => {
    const d = t[o];
    if (!(d != null && d.trim())) throw new Error(`请填写配置项：${o}`);
    return s ? encodeURIComponent(d) : d;
  });
  let r = e.url;
  if (r) {
    const a = r.indexOf("?");
    r = a < 0 ? n(r) : n(r.slice(0, a)) + "?" + n(r.slice(a + 1), !0);
    const s = new URL(r);
    if (!["https:", "http:"].includes(s.protocol) || s.username || s.password)
      throw new Error("请输入有效的 HTTP MCP 地址");
    if (s.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(s.hostname))
      throw new Error("远程 MCP 请使用 HTTPS 地址");
    if (s.hash) throw new Error("MCP 地址不能包含片段标识");
  }
  const i = Object.fromEntries(
    Object.entries(e.headers || {}).map(([a, s]) => {
      const l = n(s);
      if (/[\r\n]/.test(a + l)) throw new Error("请求头不能包含换行");
      return [a, l];
    })
  );
  return {
    ...e,
    url: r,
    command: n(e.command || ""),
    args: (e.args || []).map((a) => n(a)),
    cwd: n(e.cwd || ""),
    headers: i,
    env: Object.fromEntries(
      Object.entries(e.env || {}).map(([a, s]) => [
        a,
        n(s)
      ])
    )
  };
}
function Zl(e, t = Date.now, n = 6e4) {
  const r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
  function s(l, o, d) {
    const c = i.get(l);
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
      const E = await p.text(), h = JSON.parse(E), y = r.get(l);
      if (r.set(l, { value: h, text: E, at: t() }), m = !o && p.headers.get("X-QwenPaw-Cache") === "stale", d && (y == null ? void 0 : y.text) !== E)
        for (const g of a) g();
      return h;
    }).catch((p) => {
      const E = r.get(l);
      throw E && (E.at = t() - n + Math.min(15e3, n)), p;
    }).finally(() => {
      var p;
      ((p = i.get(l)) == null ? void 0 : p.promise) === u && i.delete(l), m && s(l, !0, !0).catch(() => {
      });
    });
    return i.set(l, { promise: u, refresh: o }), u;
  }
  return {
    get(l, o = !1) {
      const d = r.get(l);
      return d && !o ? (t() - d.at >= n && s(l, !0, !0).catch(() => {
      }), Promise.resolve(d.value)) : s(l, o, !1);
    },
    subscribe(l) {
      return a.add(l), () => {
        a.delete(l);
      };
    }
  };
}
const Ia = {
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
}, Tn = "ugsci.market.githubSources", $a = "https://github.com/anthropics/skills/tree/main/skills", Ui = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", ec = `${Ui}/skills`;
function tc(e) {
  const t = e.replace(/^\/+/, "");
  return Ln(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function on(e, t = !1) {
  const n = e.replace(/^\/+/, "");
  return ct(
    `/plugins/oss-proxy?path=${encodeURIComponent(n)}${t ? "&refresh=true" : ""}`,
    { cache: t ? "no-store" : "no-cache" }
  );
}
const Di = Zl(on), nc = Di.subscribe;
async function Ar(e, t = !1) {
  const n = e.replace(/^\/+/, "");
  if (/^(skills|mcp|agents)\/manifest\.json$/.test(n))
    return Di.get(n, t);
  const r = await on(n, t);
  if (!r.ok)
    throw new Error(`OSS fetch failed (${r.status}): ${n}`);
  return await r.json();
}
function Ot(e) {
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
function rc(e) {
  var a, s, l, o;
  const t = {}, n = e.config || {};
  for (const d of /* @__PURE__ */ new Set([
    ...e.env || [],
    ...Yl(n)
  ]))
    t[d] = `your-${d.toLowerCase().replace(/_/g, "-")}`;
  for (const [d, c] of Object.entries(n.env || {}))
    t[d] || (t[d] = c);
  let r = "🔌";
  const i = (e.icon || "").toLowerCase();
  return i.includes("folder") ? r = "📁" : i.includes("git") ? r = "🌿" : i.includes("github") ? r = "🐙" : i.includes("database") || i.includes("postgres") || i.includes("sqlite") ? r = "🗄️" : i.includes("search") || i.includes("brave") ? r = "🔍" : i.includes("browser") || i.includes("puppeteer") ? r = "🎭" : i.includes("memory") || i.includes("brain") ? r = "🧠" : i.includes("file") || i.includes("fetch") ? r = "🌐" : i.includes("slack") ? r = "💬" : i.includes("google") ? r = "📁" : i.includes("notion") ? r = "📝" : i.includes("jupyter") ? r = "📊" : i.includes("science") || i.includes("flask") ? r = "🔬" : i.includes("book") || i.includes("arxiv") ? r = "📚" : i.includes("patent") && (r = "📜"), {
    id: e.id,
    name: e.name,
    emoji: r,
    iconUrl: e.icon_url ? tc(e.icon_url) : void 0,
    category: e.category ? Ot(e.category) : "",
    description: e.description,
    transport: Xl(
      e.transport || n.transport || n.type,
      !!n.url
    ),
    url: n.url,
    headers: n.headers,
    cwd: n.cwd,
    source: e.source,
    authType: (a = e.auth) == null ? void 0 : a.type,
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
const Fi = "ugsci.market.mcpSources", Gi = "ugsci.market.expertSources";
function Wi(e, t) {
  try {
    const n = localStorage.getItem(e);
    if (!n) return [];
    const r = JSON.parse(n);
    return Array.isArray(r) ? r.filter(
      (i) => i && typeof i.id == "string" && typeof i.label == "string" && typeof i.url == "string"
    ).map((i) => ({
      id: i.id,
      label: i.label,
      url: i.url,
      enabled: i.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function qi(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function ac() {
  return Wi(Fi, "mcp");
}
function En(e) {
  qi(Fi, e);
}
function ic() {
  return Wi(Gi, "expert");
}
function bn(e) {
  qi(Gi, e);
}
function Hi(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase();
    let r;
    if (n === "github.com" || n === "www.github.com")
      r = "github";
    else if (n === "gitee.com" || n === "www.gitee.com")
      r = "gitee";
    else
      return null;
    const i = t.pathname.split("/").filter((d) => d.length > 0);
    if (i.length < 2) return null;
    const a = decodeURIComponent(i[0]), s = decodeURIComponent(i[1]);
    let l = "main", o = "";
    return i.length >= 4 && (i[2] === "tree" || i[2] === "blob") ? (l = decodeURIComponent(i[3]), i.length > 4 && (o = i.slice(4).map(decodeURIComponent).join("/"))) : i.length > 2 && (o = i.slice(2).map(decodeURIComponent).join("/")), o = o.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: a,
      repo: s,
      ref: l || "main",
      skillsPath: o,
      label: `${a}/${s}`,
      platform: r
    };
  } catch {
    return null;
  }
}
function Ji(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function sc(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase(), r = n.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!r) return null;
    const i = r[1], a = `${t.protocol}//${n}`, s = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return s ? {
      endpoint: a,
      prefix: s,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function oc() {
  try {
    const e = localStorage.getItem(Tn);
    if (!e) {
      const r = [], i = Hi($a);
      return i && r.push({
        id: Ji(
          i.owner,
          i.repo,
          i.skillsPath,
          i.platform
        ),
        url: $a,
        label: i.label,
        owner: i.owner,
        repo: i.repo,
        ref: i.ref,
        skillsPath: i.skillsPath,
        enabled: !1,
        platform: i.platform
      }), localStorage.setItem(Tn, JSON.stringify(r)), r;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const n = t.filter(
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === ec)
    ).map((r) => ({
      ...r,
      platform: r.platform || "github",
      owner: r.owner || "",
      repo: r.repo || "",
      ref: r.ref || "",
      skillsPath: r.skillsPath || ""
    }));
    return n.length !== t.length && localStorage.setItem(Tn, JSON.stringify(n)), n;
  } catch {
    return [];
  }
}
function vn(e) {
  try {
    localStorage.setItem(Tn, JSON.stringify(e));
  } catch {
  }
}
function lc(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const n = t[1], r = {}, i = n.split(`
`);
  let a = "";
  for (const s of i) {
    const l = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (l) {
      a = l[1];
      let o = l[2].trim();
      (o.startsWith('"') && o.endsWith('"') || o.startsWith("'") && o.endsWith("'")) && (o = o.slice(1, -1)), a === "name" ? r.name = o : a === "description" ? r.description = o : a === "version" ? r.version = o : a === "author" && (r.author = o);
    }
  }
  return r;
}
async function cc(e) {
  const t = e.platform === "gitee", n = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", r = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${n}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${n}?ref=${encodeURIComponent(e.ref)}`, i = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (i.Authorization = `token ${e.accessToken}`);
  const a = await fetch(r, {
    headers: i
  });
  if (!a.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${a.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const s = await a.json();
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
        const E = {};
        t && e.accessToken && (E.Authorization = `token ${e.accessToken}`);
        const h = await fetch(m, {
          headers: E
        });
        if (!h.ok) return p;
        const y = await h.text(), g = lc(y);
        return {
          ...p,
          name: g.name || d.name,
          description: g.description || "",
          version: g.version || null,
          author: g.author || null
        };
      } catch {
        return p;
      }
    })
  );
}
async function dc(e) {
  const t = sc(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, i = r.split("/").map(encodeURIComponent).join("/"), a = await on(`${i}/manifest.json`);
  if (!a.ok)
    throw new Error(`无法获取技能列表: manifest.json (${a.status})`);
  const s = await a.json(), l = [];
  if (s && s.tag_groups && typeof s.tag_groups == "object")
    for (const [c, m] of Object.entries(s.tag_groups))
      Array.isArray(m) && l.push({
        id: c,
        label: Ot(c),
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
      const E = p.split("/").map(encodeURIComponent).join("/"), h = `${n}/${i}/${E}`;
      let y = null;
      if (u.metadata) {
        const f = u.metadata.match(/version:\s*"?([\d.]+)"?/);
        f && (y = f[1]);
      }
      const g = m ? `${e.label}/${m}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: g,
        name: u.name || p.split("/").pop() || p,
        description: u.description || "",
        source_url: h,
        html_url: h,
        version: y,
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
async function uc(e = !1) {
  const t = await Ar("mcp/manifest.json", e), n = [], r = {};
  if (t.tag_groups && typeof t.tag_groups == "object")
    for (const [a, s] of Object.entries(t.tag_groups))
      Array.isArray(s) && (r[a] = s, n.push({
        id: a,
        label: Ot(a),
        tags: s
      }));
  return { servers: (t.servers || []).map((a) => {
    var o, d, c;
    let s = "";
    const l = a.tags || [];
    for (const [m, u] of Object.entries(r))
      if (u.some((p) => l.includes(p))) {
        s = m;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      tags: l,
      transport: a.transport || ((o = a.config) == null ? void 0 : o.transport) || ((d = a.config) == null ? void 0 : d.type) || ((c = a.config) != null && c.url ? "streamable_http" : "stdio"),
      input_hints: a.input_hints,
      requirements: a.requirements,
      limitations: a.limitations,
      auth: a.auth,
      availability: a.availability,
      config: a.config,
      env: Array.isArray(a.env) ? a.env : void 0,
      source: a.source,
      icon: a.icon,
      icon_url: a.icon_url || a.icon_path || void 0,
      category: s
    };
  }), categories: n };
}
async function mc(e = !1) {
  const t = await Ar("skills/manifest.json", e), n = [], r = /* @__PURE__ */ new Set();
  function i(a, s) {
    for (const l of a) {
      if ((l == null ? void 0 : l.type) === "collection" && Array.isArray(l.children)) {
        i(l.children, l.name || s);
        continue;
      }
      const o = String((l == null ? void 0 : l.path) || (l == null ? void 0 : l.name) || "").trim();
      if (!o) continue;
      const d = o.split("/").map(encodeURIComponent).join("/"), c = `${Ui}/skills/${d}`, m = typeof l.tag == "string" && l.tag.trim() ? l.tag.trim() : void 0;
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
  if (Array.isArray(t) ? i(
    t.map(
      (a) => typeof a == "string" ? { name: a, path: a } : a
    )
  ) : t && Array.isArray(t.skills) && i(t.skills), n.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: n,
    categories: Array.from(r).map((a) => ({
      id: a,
      label: a
    }))
  };
}
async function Vi(e = !1) {
  const t = await Ar("agents/manifest.json", e), n = [], r = {};
  if (t.tag_groups && typeof t.tag_groups == "object")
    for (const [a, s] of Object.entries(t.tag_groups))
      Array.isArray(s) && (r[a] = s, n.push({
        id: a,
        label: Ot(a),
        tags: s
      }));
  return { agents: (t.agents || []).map((a) => {
    let s = "";
    const l = a.tags || [];
    for (const [o, d] of Object.entries(r))
      if (d.some((c) => l.includes(c))) {
        s = o;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      path: a.path || "",
      tags: l,
      config: a.config,
      instructions: a.instructions,
      skills_manifest: a.skills_manifest,
      drivers: a.drivers,
      category: s
    };
  }), categories: n };
}
async function pc(e) {
  const t = e.filter((s) => s.enabled), n = await Promise.all(
    t.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills: l, categories: o } = await dc(s);
          return {
            skills: l,
            categories: o,
            error: null,
            label: s.label
          };
        } else
          return {
            skills: await cc(s),
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
  ), r = [], i = [], a = [];
  for (const s of n)
    r.push(...s.skills), i.push(...s.categories), s.error && a.push({ label: s.label, message: s.error });
  return { skills: r, errors: a, categories: i };
}
function gc({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const i = P().React, { useState: a } = i, {
    Modal: s,
    Input: l,
    Button: o,
    List: d,
    Tag: c,
    Switch: m,
    Typography: u,
    Tooltip: p,
    message: E
  } = P().antd, { PlusOutlined: h, DeleteOutlined: y, LinkOutlined: g, GithubOutlined: f } = P().antdIcons || {}, { Text: x } = u, [v, k] = a(""), [M, z] = a(""), A = () => {
    const _ = v.trim();
    if (!_) return;
    const $ = Hi(_);
    if (!$) {
      E.error(
        "无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接"
      );
      return;
    }
    const I = Ji(
      $.owner,
      $.repo,
      $.skillsPath,
      $.platform
    );
    if (n.some((j) => j.id === I)) {
      E.warning("该源已存在");
      return;
    }
    const R = {
      id: I,
      url: _,
      label: $.label,
      owner: $.owner,
      repo: $.repo,
      ref: $.ref,
      skillsPath: $.skillsPath,
      enabled: !0,
      platform: $.platform,
      accessToken: M.trim() || void 0
    }, S = [...n, R];
    vn(S), r(S), k(""), z(""), E.success(`已添加源: ${$.label}`);
  }, T = (_, $) => {
    const I = n.map((R) => R.id === _ ? { ...R, enabled: $ } : R);
    vn(I), r(I);
  }, F = (_, $) => {
    const I = n.map(
      (R) => R.id === _ ? { ...R, accessToken: $.trim() || void 0 } : R
    );
    vn(I), r(I);
  }, G = (_) => {
    const $ = n.filter((I) => I.id !== _);
    vn($), r($), E.success("已移除源");
  };
  return i.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        f ? i.createElement(f, { style: { fontSize: 18 } }) : null,
        i.createElement("span", null, "配置技能源")
      ),
      footer: i.createElement(o, { onClick: t }, "关闭"),
      width: 640
    },
    i.createElement(
      "div",
      { style: { marginBottom: 16 } },
      i.createElement(
        x,
        {
          type: "secondary",
          style: { fontSize: 12, display: "block", marginBottom: 8 }
        },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        i.createElement(l, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: v,
          onChange: (_) => k(_.target.value),
          onPressEnter: A,
          prefix: g ? i.createElement(g) : void 0,
          style: { flex: 1 }
        }),
        i.createElement(
          o,
          {
            type: "primary",
            icon: h ? i.createElement(h) : void 0,
            onClick: A
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      v.trim() && v.trim().toLowerCase().includes("gitee.com") ? i.createElement(
        "div",
        {
          style: {
            marginTop: 8,
            display: "flex",
            gap: 8,
            alignItems: "center"
          }
        },
        i.createElement(
          x,
          {
            type: "secondary",
            style: { fontSize: 12, whiteSpace: "nowrap" }
          },
          "Gitee Token:"
        ),
        i.createElement(l.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: M,
          onChange: (_) => z(_.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
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
        x,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    i.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (_) => i.createElement(
        d.Item,
        {
          actions: [
            i.createElement(
              p,
              { title: _.enabled ? "点击禁用" : "点击启用" },
              i.createElement(m, {
                size: "small",
                checked: _.enabled,
                onChange: ($) => T(_.id, $)
              })
            ),
            i.createElement(
              p,
              { title: "移除此源" },
              i.createElement(o, {
                size: "small",
                type: "text",
                danger: !0,
                icon: y ? i.createElement(y) : void 0,
                onClick: () => G(_.id)
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
              c,
              {
                color: _.platform === "gitee" ? "orange" : _.platform === "oss" ? "green" : "blue",
                style: { fontSize: 11 }
              },
              _.platform === "gitee" ? "Gitee" : _.platform === "oss" ? "OSS" : "GitHub"
            ),
            i.createElement(
              c,
              { style: { fontSize: 11 } },
              _.label
            ),
            _.skillsPath ? i.createElement(
              x,
              { type: "secondary", style: { fontSize: 11 } },
              `/${_.skillsPath}`
            ) : null,
            _.platform !== "oss" ? i.createElement(
              x,
              { type: "secondary", style: { fontSize: 11 } },
              `@${_.ref}`
            ) : null
          ),
          i.createElement(
            x,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            _.url
          ),
          // Gitee token input for existing Gitee sources
          _.platform === "gitee" ? i.createElement(
            "div",
            {
              style: {
                marginTop: 6,
                display: "flex",
                gap: 6,
                alignItems: "center"
              }
            },
            i.createElement(
              x,
              {
                type: "secondary",
                style: { fontSize: 11, whiteSpace: "nowrap" }
              },
              "Token:"
            ),
            i.createElement(l.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: _.accessToken || "",
              onChange: ($) => F(_.id, $.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Aa({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: i
}) {
  const a = P().React, { useState: s } = a, {
    Modal: l,
    Input: o,
    Button: d,
    List: c,
    Tag: m,
    Switch: u,
    Typography: p,
    Tooltip: E,
    message: h
  } = P().antd, {
    PlusOutlined: y,
    DeleteOutlined: g,
    LinkOutlined: f,
    ApiOutlined: x,
    UserOutlined: v,
    ImportOutlined: k,
    ExportOutlined: M,
    CopyOutlined: z
  } = P().antdIcons || {}, { Text: A } = p, [T, F] = s(""), [G, _] = s(""), [$, I] = s(""), [R, S] = s(!1), j = i === "mcp" ? "MCP" : "专家模板", q = i === "mcp" ? x ? a.createElement(x, { style: { fontSize: 18 } }) : null : v ? a.createElement(v, { style: { fontSize: 18 } }) : null, L = () => {
    const K = T.trim(), U = G.trim();
    if (!K) return;
    const ie = U || K.slice(0, 40), ue = `${i}:${K}`;
    if (n.some((Q) => Q.id === ue)) {
      h.warning("该源已存在");
      return;
    }
    const le = {
      id: ue,
      label: ie,
      url: K,
      enabled: !0,
      type: i
    }, ae = [...n, le];
    i === "mcp" ? En(ae) : bn(ae), r(ae), F(""), _(""), h.success(`已添加${j}源: ${ie}`);
  }, N = (K, U) => {
    const ie = n.map((ue) => ue.id === K ? { ...ue, enabled: U } : ue);
    i === "mcp" ? En(ie) : bn(ie), r(ie);
  }, J = (K) => {
    const U = n.filter((ie) => ie.id !== K);
    i === "mcp" ? En(U) : bn(U), r(U), h.success("已移除源");
  }, B = () => {
    const K = JSON.stringify({ type: i, sources: n }, null, 2);
    try {
      navigator.clipboard.writeText(K), h.success(`${j}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const U = document.createElement("textarea");
      U.value = K, document.body.appendChild(U), U.select(), document.execCommand("copy"), document.body.removeChild(U), h.success(`${j}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, O = () => {
    const K = $.trim();
    if (!K) {
      h.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const U = JSON.parse(K);
      let ie = [];
      if (Array.isArray(U))
        ie = U;
      else if (U && Array.isArray(U.sources))
        ie = U.sources;
      else if (U && typeof U == "object")
        ie = [U];
      else
        throw new Error("Invalid format");
      const ue = ie.filter(
        (W) => W && typeof W.url == "string" && typeof W.label == "string"
      );
      if (ue.length === 0) {
        h.error("未找到有效的源数据");
        return;
      }
      const le = new Set(n.map((W) => W.id)), ae = [];
      for (const W of ue) {
        const ee = W.id || `${i}:${W.url}`;
        le.has(ee) || ae.push({
          id: ee,
          label: W.label,
          url: W.url,
          enabled: W.enabled !== !1,
          type: i
        });
      }
      if (ae.length === 0) {
        h.info("所有源均已存在，无新增");
        return;
      }
      const Q = [...n, ...ae];
      i === "mcp" ? En(Q) : bn(Q), r(Q), I(""), S(!1), h.success(`成功导入 ${ae.length} 个${j}源`);
    } catch (U) {
      h.error(`JSON 解析失败: ${U.message || "格式错误"}`);
    }
  };
  return a.createElement(
    l,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        q,
        a.createElement("span", null, `配置${j}源`)
      ),
      footer: a.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        a.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          a.createElement(
            d,
            {
              icon: M ? a.createElement(M) : void 0,
              onClick: B,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          a.createElement(
            d,
            {
              icon: k ? a.createElement(k) : void 0,
              onClick: () => S(!R),
              size: "small"
            },
            R ? "隐藏导入" : "导入JSON"
          )
        ),
        a.createElement(d, { onClick: t }, "关闭")
      ),
      width: 680
    },
    // Description
    a.createElement(
      A,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 12 }
      },
      `配置${j}源地址，支持从远程仓库或团队共享的 JSON 导入${j}配置。`
    ),
    // Import section (collapsible)
    R ? a.createElement(
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
      a.createElement(
        A,
        {
          strong: !0,
          style: { fontSize: 12, display: "block", marginBottom: 8 }
        },
        `粘贴${j}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      a.createElement(o.TextArea, {
        placeholder: i === "mcp" ? `{
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
        value: $,
        onChange: (K) => I(K.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            onClick: O
          },
          "导入"
        ),
        a.createElement(
          d,
          {
            size: "small",
            onClick: () => I("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    a.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      a.createElement(o, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: G,
        onChange: (K) => _(K.target.value),
        style: { width: 200 }
      }),
      a.createElement(o, {
        placeholder: i === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: T,
        onChange: (K) => F(K.target.value),
        onPressEnter: L,
        prefix: f ? a.createElement(f) : void 0,
        style: { flex: 1 }
      }),
      a.createElement(
        d,
        {
          type: "primary",
          icon: y ? a.createElement(y) : void 0,
          onClick: L
        },
        "添加"
      )
    ),
    // Source list
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
        A,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (K) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              E,
              { title: K.enabled ? "点击禁用" : "点击启用" },
              a.createElement(u, {
                size: "small",
                checked: K.enabled,
                onChange: (U) => N(K.id, U)
              })
            ),
            a.createElement(
              E,
              { title: "移除此源" },
              a.createElement(d, {
                size: "small",
                type: "text",
                danger: !0,
                icon: g ? a.createElement(g) : void 0,
                onClick: () => J(K.id)
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
              m,
              {
                color: i === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              K.label
            ),
            K.enabled ? null : a.createElement(
              m,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          a.createElement(
            A,
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
    a.createElement(
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
      a.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
function fc({
  template: e,
  agentId: t,
  agentName: n,
  existing: r,
  onSaved: i,
  onConnected: a,
  onClose: s
}) {
  var Se;
  const { React: l, antd: o, openExternalLink: d } = P(), { useState: c, useRef: m, useEffect: u } = l, { Modal: p, Button: E, Input: h, Alert: y, Tag: g } = o, f = l.createElement, x = e.authType === "oauth2", v = Object.entries(e.env || {}).filter(
    ([, fe]) => fe.startsWith("your-") || fe.includes("${")
  ), [k, M] = c({}), [z, A] = c(r), [T, F] = c(r ? "saved" : "config"), [G, _] = c(""), [$, I] = c(""), [R, S] = c(""), [j, q] = c(!1), [L, N] = c(""), [J, B] = c(""), [O, K] = c(0), U = m(!0), ie = m(0), ue = m(""), le = { "Content-Type": "application/json", "X-Agent-Id": t }, ae = encodeURIComponent(e.id), Q = (fe, ye = {}) => pe(fe, {
    ...ye,
    headers: le,
    cache: "no-store",
    bypassCache: !0
  }), W = (fe) => fe ? Q(
    `/mcp/oauth/session/${ae}?session_id=${encodeURIComponent(fe)}`,
    { method: "DELETE" }
  ).then(
    () => !0,
    () => !1
  ) : Promise.resolve(!0);
  u(() => (U.current = !0, () => {
    U.current = !1, ie.current += 1, W(ue.current);
  }), []);
  const ee = (fe) => U.current && ie.current === fe, X = (fe) => {
    const ye = bt(fe);
    if (!ye)
      throw new Error("授权服务返回的登录地址无效，请联系服务提供方。");
    d ? d(ye) : window.open(ye, "_blank", "noopener,noreferrer");
  }, D = async (fe, ye = ++ie.current) => {
    _(""), F("checking");
    try {
      if (x) {
        const V = await Q(
          `/mcp/oauth/status/${ae}`
        );
        if (!ee(ye)) return;
        if (!V.authorized) {
          F("saved"), _("账号尚未授权或授权已过期，请点击登录授权。");
          return;
        }
      }
      const we = await Q(`/mcp/${ae}`, {
        method: "PUT",
        body: JSON.stringify({ enabled: !0 })
      });
      if (!ee(ye)) return;
      A({ ...fe, ...we, enabled: !0 }), i({ ...fe, ...we, enabled: !0 });
      const b = await Q(`/mcp/tools/${ae}`);
      if (!ee(ye)) return;
      if (!Array.isArray(b) || b.length === 0) {
        _(
          "配置已启用，但服务尚未返回可用工具。可稍后重新检测，或检查账号权限和服务接入要求。"
        ), F("error");
        return;
      }
      K(b.length), F("connected"), a();
    } catch {
      if (!ee(ye)) return;
      F("error"), _(
        x ? "账号授权后，工具连接检测未通过。请检查网络或服务账号权限后重试；授权失效可重新登录。" : "配置已保存，工具连接检测未通过。请检查网络、密钥权限或本地运行环境后重试。"
      );
    }
  }, me = async (fe, ye = ++ie.current) => {
    F("starting"), _(""), I("");
    const we = ue.current;
    if (ue.current = "", S(""), await W(we), !!ee(ye))
      try {
        const b = await Q(
          `/mcp/oauth/start/${ae}`,
          {
            // The backend uses the saved endpoint, including securely stored URL credentials.
            method: "POST",
            body: JSON.stringify({
              url: "",
              client_id: L.trim(),
              scope: J.trim()
            })
          }
        );
        if (!ee(ye)) {
          W(b.session_id);
          return;
        }
        if (!b.session_id || !bt(b.auth_url))
          throw new Error("Invalid authorization response");
        ue.current = b.session_id, S(b.session_id), I(b.auth_url), F("waiting"), X(b.auth_url);
      } catch {
        if (!ee(ye)) return;
        F("error"), _(
          "无法发起登录授权。请确认服务支持标准 MCP OAuth；若服务要求预先注册客户端，可在高级设置填写客户端 ID，或查看服务接入说明后重试。"
        );
      }
  };
  u(() => {
    if (T !== "waiting" || !R || !z) return;
    const fe = ie.current;
    let ye = !1, we = !1, b, V = 0;
    const C = Date.now() + 5 * 6e4, re = async () => {
      if (!(ye || we || !ee(fe))) {
        if (clearTimeout(b), Date.now() >= C) {
          W(R), F("error"), _("等待授权超时。配置已保留，请重新登录授权。");
          return;
        }
        we = !0;
        try {
          const ge = await Q(
            `/mcp/oauth/status/${ae}?session_id=${encodeURIComponent(
              R
            )}`
          );
          if (ye || !ee(fe)) return;
          if (V = 0, ge.authorized && ge.phase === "authorized") {
            ue.current = "", S(""), D(z, fe);
            return;
          }
          if (["denied", "failed", "cancelled", "expired"].includes(
            ge.phase || ""
          )) {
            F("error"), _(
              ge.phase === "denied" ? "授权未获同意。你可以重新登录并选择允许的权限。" : "本次授权未完成或已失效，配置已保留，可重新登录授权。"
            );
            return;
          }
        } catch {
          if (++V >= 3 && !ye && ee(fe)) {
            F("error"), _("暂时无法查询授权状态，请检查网络后重试。");
            return;
          }
        } finally {
          we = !1;
        }
        !ye && ee(fe) && (b = setTimeout(re, 2e3));
      }
    };
    return re(), window.addEventListener("focus", re), () => {
      ye = !0, clearTimeout(b), window.removeEventListener("focus", re);
    };
  }, [T, R, z]);
  const ve = async () => {
    const fe = v.filter(([b]) => {
      var V;
      return !((V = k[b]) != null && V.trim());
    });
    if (fe.length) {
      _(
        `请填写：${fe.map(
          ([b]) => {
            var V, C;
            return ((C = ((V = e.inputHints) == null ? void 0 : V[b]) || Ia[b]) == null ? void 0 : C.label) || b;
          }
        ).join("、")}`
      );
      return;
    }
    let ye;
    try {
      ye = Ql(
        {
          url: e.url,
          command: e.command,
          args: e.args,
          headers: e.headers,
          cwd: e.cwd,
          env: { ...e.env, ...k }
        },
        k
      );
    } catch (b) {
      _(b instanceof Error ? b.message : "请检查连接配置");
      return;
    }
    const we = ++ie.current;
    F("saving"), _("");
    try {
      const b = {
        name: e.name,
        description: e.description,
        enabled: !x,
        transport: e.transport,
        ...ye
      }, V = z ? await Q(`/mcp/${ae}`, {
        method: "PUT",
        body: JSON.stringify(b)
      }) : await Tr(t, {
        client_key: e.id,
        client: b
      });
      if (!ee(we)) return;
      const C = { ...V, key: e.id, enabled: !x };
      A(C), M({}), i(C), x ? await me(C, we) : await D(C, we);
    } catch {
      if (!ee(we)) return;
      F("config"), _(
        "配置未能保存，请检查服务配置或是否已有同名连接后重试。填写内容暂时保留在此窗口。"
      );
    }
  }, de = async () => {
    ie.current += 1, F("saved"), _("已取消本次授权等待，配置已保留。尚未完成授权的连接保持未启用。"), !await W(ue.current) && U.current && _(
      "已停止等待，但暂时无法取消服务端授权流程。请关闭授权网页；连接不会在此窗口自动启用。"
    ), ue.current = "", S(""), I("");
  }, Y = ["saving", "starting", "waiting", "checking"].includes(T), be = bt(e.source), ke = bt(e.setupUrl), Ae = T === "connected" ? `已连接 · 已读取 ${O} 个工具` : T === "waiting" ? "等待浏览器登录授权" : T === "starting" ? "正在准备安全登录" : T === "checking" ? "正在检测可用工具" : T === "saving" ? "正在保存连接配置" : z ? x ? "已保存 · 账号授权与连接待确认" : "已保存 · 连接待检测" : "填写接入信息", Re = [
    f(
      E,
      { key: "close", onClick: s },
      Y ? "关闭并停止等待" : "关闭"
    )
  ];
  return T === "config" ? Re.push(
    f(
      E,
      { key: "save", type: "primary", onClick: ve },
      z ? "更新凭证并连接" : "添加连接"
    )
  ) : T === "waiting" ? Re.push(
    f(E, { key: "cancel", onClick: de }, "取消授权"),
    f(
      E,
      {
        key: "reopen",
        type: "primary",
        onClick: () => X($)
      },
      "重新打开授权页"
    )
  ) : !Y && z && (v.length && Re.push(
    f(
      E,
      {
        key: "edit",
        onClick: () => {
          M({}), _(""), F("config");
        }
      },
      "更新凭证"
    )
  ), Re.push(
    f(
      E,
      { key: "check", onClick: () => D(z) },
      "重新检测"
    )
  ), x && Re.push(
    f(
      E,
      {
        key: "auth",
        type: "primary",
        onClick: () => me()
      },
      "登录授权"
    )
  )), f(
    p,
    {
      title: `连接 ${e.name}`,
      open: !0,
      onCancel: s,
      footer: Re,
      width: 560,
      destroyOnClose: !0
    },
    f(
      "p",
      { style: { color: "var(--app-card-muted)" } },
      e.description
    ),
    f("p", null, `目标专家：${n}`),
    f(g, { color: T === "connected" ? "green" : "blue" }, Ae),
    x ? f(y, {
      style: { margin: "12px 0" },
      type: "info",
      showIcon: !0,
      message: "在服务提供方页面登录并确认权限，返回这里自动完成连接检测。UGSci 不需要你的账号密码。"
    }) : null,
    G ? f(y, {
      role: "alert",
      style: { margin: "12px 0" },
      type: "warning",
      showIcon: !0,
      message: G
    }) : null,
    ...(e.requirements || []).map(
      (fe, ye) => f("p", { key: `req-${ye}` }, fe)
    ),
    ke ? f(
      "p",
      null,
      f(
        "a",
        {
          href: ke,
          target: "_blank",
          rel: "noopener noreferrer",
          onClick: d ? (fe) => {
            fe.preventDefault(), d(ke);
          } : void 0
        },
        "开通账号 / 获取授权信息 ↗"
      )
    ) : null,
    be ? f(
      "a",
      {
        href: be,
        target: "_blank",
        rel: "noopener noreferrer",
        onClick: d ? (fe) => {
          fe.preventDefault(), d(be);
        } : void 0
      },
      "查看服务接入说明 ↗"
    ) : null,
    T === "config" ? f(
      "div",
      { style: { marginTop: 16 } },
      ...v.map(([fe]) => {
        var V;
        const ye = ((V = e.inputHints) == null ? void 0 : V[fe]) || Ia[fe], we = bt(ye == null ? void 0 : ye.link), b = (ye == null ? void 0 : ye.label) || fe;
        return f(
          "div",
          { key: fe, style: { marginBottom: 16 } },
          f(
            "label",
            {
              htmlFor: `mcp-input-${fe}`,
              style: { display: "block", marginBottom: 6 }
            },
            `${b}（必填）`
          ),
          ye != null && ye.help ? f(
            "p",
            { style: { fontSize: 12, margin: "4px 0" } },
            ye.help
          ) : null,
          we ? f(
            "a",
            {
              href: we,
              target: "_blank",
              rel: "noopener noreferrer",
              onClick: d ? (C) => {
                C.preventDefault(), d(we);
              } : void 0
            },
            "获取密钥 / 查看设置 ↗"
          ) : null,
          f((ye == null ? void 0 : ye.isSecret) === !1 ? h : h.Password, {
            id: `mcp-input-${fe}`,
            placeholder: `请输入 ${b}`,
            value: k[fe] || "",
            autoComplete: "off",
            onChange: (C) => M((re) => ({ ...re, [fe]: C.target.value }))
          })
        );
      })
    ) : null,
    x ? f(
      "div",
      { style: { marginTop: 12 } },
      f(
        E,
        {
          type: "link",
          size: "small",
          disabled: Y,
          onClick: () => q(!j)
        },
        j ? "收起高级设置" : "高级设置（服务要求时填写）"
      ),
      j ? f(
        "div",
        null,
        f(h, {
          "aria-label": "OAuth 客户端 ID",
          placeholder: "客户端 ID（通常自动获取）",
          value: L,
          disabled: Y,
          onChange: (fe) => N(fe.target.value)
        }),
        f(h, {
          "aria-label": "OAuth 权限范围",
          placeholder: "权限范围（按服务文档填写，可留空）",
          value: J,
          disabled: Y,
          style: { marginTop: 8 },
          onChange: (fe) => B(fe.target.value)
        })
      ) : null
    ) : null,
    (Se = e.limitations) != null && Se.length ? f(
      "details",
      { style: { marginTop: 12 } },
      f("summary", null, "使用限制"),
      ...e.limitations.map((fe, ye) => f("p", { key: ye }, fe))
    ) : null
  );
}
function yc({
  open: e,
  onClose: t
}) {
  const { React: n, antd: r } = P(), i = n.createElement, { Modal: a, Input: s, Button: l, Alert: o, Checkbox: d, Radio: c, Space: m } = r, [u, p] = n.useState({
    id: "",
    name: "",
    version: "1.0.0",
    description: "",
    author: "",
    system_prompt: "",
    tags: "",
    recommended_skills: ""
  }), [E, h] = n.useState(""), [y, g] = n.useState("submission"), [f, x] = n.useState(null), [v, k] = n.useState(""), [M, z] = n.useState(!1), [A, T] = n.useState(""), [F, G] = n.useState(""), [_, $] = n.useState(null);
  n.useEffect(() => {
    if (!e) {
      h("");
      return;
    }
    let B = !0;
    return k(""), z(!1), $(null), G(""), x(null), pe("/publisher/status").then((O) => {
      B && x(O);
    }).catch(() => {
      B && G("无法读取发布服务配置，请稍后重试");
    }), () => {
      B = !1;
    };
  }, [e]);
  const I = {
    ...u,
    tags: u.tags.split(/[,，]/).map((B) => B.trim()).filter(Boolean),
    recommended_skills: u.recommended_skills.split(/[,，]/).map((B) => B.trim()).filter(Boolean)
  }, R = JSON.stringify({ expert: I, mode: y }), S = R + E, j = y === "release" ? f == null ? void 0 : f.direct_publish_configured : f == null ? void 0 : f.submission_configured, q = async (B) => {
    G(""), $(null), T(B);
    try {
      const O = await pe(`/publisher/expert/${B}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UGSci-Publisher-Token": E
        },
        body: R
      });
      B === "inspect" && k(S), $(O), O.status === "published" && Vi(!0).catch(() => {
      });
    } catch (O) {
      k("");
      let K = (O == null ? void 0 : O.message) || "提交失败，请重试";
      try {
        K = JSON.parse(K).detail || K;
      } catch {
      }
      G(String(K));
    } finally {
      T("");
    }
  }, L = async (B) => {
    if (B) {
      G(""), $(null), k(""), z(!1);
      try {
        if (B.size > 1024 * 1024) throw new Error("专家 JSON 不能超过 1 MB");
        const O = JSON.parse(await B.text()), K = [
          "id",
          "name",
          "version",
          "description",
          "author",
          "system_prompt",
          "tags",
          "recommended_skills"
        ];
        if (!O || typeof O != "object" || Array.isArray(O) || Object.keys(O).some((U) => !K.includes(U)))
          throw new Error(
            "仅支持公开专家模板字段；请移除记忆、知识文件、凭证和其他运行配置"
          );
        for (const U of K)
          if (O[U] !== void 0 && (["tags", "recommended_skills"].includes(U) ? !Array.isArray(O[U]) || O[U].some((ie) => typeof ie != "string") : typeof O[U] != "string"))
            throw new Error(`字段 ${U} 格式无效`);
        p({
          id: O.id || "",
          name: O.name || "",
          version: O.version || "1.0.0",
          description: O.description || "",
          author: O.author || "",
          system_prompt: O.system_prompt || "",
          tags: (O.tags || []).join(", "),
          recommended_skills: (O.recommended_skills || []).join(", ")
        });
      } catch (O) {
        G((O == null ? void 0 : O.message) || "模板导入失败");
      }
    }
  }, N = () => {
    const B = {
      id: "yourname-expert",
      name: "公开专家",
      version: "1.0.0",
      description: "专家职责",
      author: "团队名",
      system_prompt: "填写可公开分享的专家提示词。",
      tags: ["科研"],
      recommended_skills: []
    }, O = URL.createObjectURL(
      new Blob([JSON.stringify(B, null, 2)], { type: "application/json" })
    ), K = document.createElement("a");
    K.href = O, K.download = "ugsci-expert-template.json", K.click(), setTimeout(() => URL.revokeObjectURL(O), 1e3);
  }, J = (B, O, K, U = !1) => i(
    "label",
    { key: B, style: { display: "block", marginBottom: 12 } },
    i("div", { style: { marginBottom: 4 } }, O),
    i(U ? s.TextArea : s, {
      "aria-label": O,
      value: u[B],
      placeholder: K,
      rows: B === "system_prompt" ? 7 : 2,
      onChange: (ie) => {
        p((ue) => ({ ...ue, [B]: ie.target.value })), $(null);
      }
    })
  );
  return i(
    a,
    {
      open: e,
      title: "发布 / 更新专家到 UGSci",
      width: 720,
      destroyOnHidden: !0,
      closable: !A,
      maskClosable: !A,
      onCancel: () => {
        A || (h(""), t());
      },
      footer: null
    },
    i(o, {
      type: "info",
      showIcon: !0,
      message: "编写可公开分享的专家模板",
      description: "填写公开提示词与推荐技能名称。此入口不读取本机专家的聊天、记忆、知识文件或账号配置。更新时保留 ID、提高版本号；投稿审核通过后市场可见。",
      style: { marginBottom: 16 }
    }),
    i(
      m,
      { style: { marginBottom: 16 }, wrap: !0 },
      i(
        "label",
        null,
        "导入专家 JSON ",
        i("input", {
          type: "file",
          accept: ".json,application/json",
          "aria-label": "导入专家 JSON",
          disabled: !!A,
          onChange: (B) => {
            var O;
            L((O = B.target.files) == null ? void 0 : O[0]), B.target.value = "";
          }
        })
      ),
      i(l, { onClick: N }, "下载空白模板")
    ),
    J(
      "id",
      "专家 ID",
      "例如 alice-reservoir，须以管理员分配的命名空间开头"
    ),
    i(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } },
      J("name", "专家名称", "公开显示的名称"),
      J("version", "版本号", "例如 1.0.0")
    ),
    J("description", "简介", "专家擅长什么", !0),
    J("author", "公开作者", "可使用团队名或笔名"),
    J(
      "system_prompt",
      "公开提示词",
      "填写专家职责、流程与输出要求；勿填写私人资料或密钥",
      !0
    ),
    J("tags", "标签", "科研, 油藏工程"),
    J(
      "recommended_skills",
      "推荐技能名称",
      "多个名称以逗号分隔，不上传技能文件"
    ),
    i(
      "label",
      null,
      "投稿凭证（仅本次使用）",
      i(s.Password, {
        "aria-label": "投稿凭证",
        value: E,
        autoComplete: "off",
        onChange: (B) => h(B.target.value),
        placeholder: "管理员分配的投稿凭证，无需 OSS AccessKey"
      })
    ),
    i(c.Group, {
      value: y,
      style: { margin: "12px 0" },
      onChange: (B) => {
        g(B.target.value), $(null);
      },
      options: [
        { label: "投稿待审核", value: "submission" },
        {
          label: "管理员发布",
          value: "release",
          disabled: !(f != null && f.direct_publish_configured)
        }
      ]
    }),
    i(
      "div",
      { style: { marginBottom: 12 } },
      i(
        d,
        {
          checked: M,
          onChange: (B) => z(B.target.checked)
        },
        "我确认以上内容可公开分享，不含私人数据或账号密钥"
      )
    ),
    f && !j && i(o, {
      type: "warning",
      message: "管理员尚未配置远端发布服务，当前无法上传 OSS。请联系管理员开通投稿服务。",
      style: { marginBottom: 12 }
    }),
    F && i(o, {
      type: "error",
      showIcon: !0,
      message: F,
      style: { marginBottom: 12 }
    }),
    _ && i(o, {
      showIcon: !0,
      type: _.status === "checked" ? "info" : "success",
      message: _.status === "checked" ? `服务端检查通过：${_.operation === "update" ? "更新现有专家" : "新增专家"}` : _.status === "published" ? "已发布，OSS 内容与目录已校验" : "已上传 OSS，等待管理员审核",
      description: i(
        "div",
        { style: { overflowWrap: "anywhere" } },
        i("div", null, `回执：${_.receipt_id}`),
        i("div", null, `SHA-256：${_.sha256}`)
      ),
      style: { marginBottom: 12 }
    }),
    i(
      m,
      null,
      i(
        l,
        {
          disabled: !!A || !j || !E.trim() || !u.id || !u.name || !u.system_prompt,
          loading: A === "inspect",
          onClick: () => q("inspect")
        },
        "检查归属与版本"
      ),
      i(
        l,
        {
          type: "primary",
          disabled: !!A || !j || !M || v !== S,
          loading: A === "publish",
          onClick: () => q("publish")
        },
        y === "release" ? "发布新版本" : "上传到 OSS 待审核"
      )
    ),
    A && i(
      "div",
      { role: "status", style: { marginTop: 12 } },
      A === "inspect" ? "正在校验身份、命名空间与版本…" : "正在写入 OSS 并核验回执，请稍候…"
    )
  );
}
async function hc() {
  return pe("/market/providers");
}
async function Ec(e) {
  return pe(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function bc(e, t, n, r, i) {
  return pe("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: n,
      lang: r,
      category: i || void 0
    })
  });
}
function za(e) {
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
async function Ra(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), pe("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function vc({
  embedded: e = !1
} = {}) {
  var pa;
  const t = P().React, { useState: n, useEffect: r, useCallback: i, useMemo: a, useRef: s } = t, {
    Spin: l,
    Empty: o,
    Input: d,
    Button: c,
    message: m,
    Row: u,
    Col: p,
    Card: E,
    Tag: h,
    Tooltip: y,
    Typography: g,
    Select: f,
    Drawer: x,
    Descriptions: v,
    Tabs: k,
    Badge: M,
    Progress: z,
    Modal: A,
    Alert: T
  } = P().antd, {
    ReloadOutlined: F,
    SearchOutlined: G,
    DownloadOutlined: _,
    AppstoreOutlined: $,
    ShopOutlined: I,
    CheckCircleOutlined: R,
    LoadingOutlined: S,
    UserOutlined: j,
    UserAddOutlined: q,
    SettingOutlined: L,
    GithubOutlined: N,
    ApiOutlined: J
  } = P().antdIcons || {}, { Text: B, Paragraph: O, Title: K } = g, [U, ie] = n("skills"), [ue, le] = n([]), [ae, Q] = n([]), [W, ee] = n([]), [X, D] = n(""), [me, ve] = n(""), [de, Y] = n(!1), [be, ke] = n(!1), [Ae, Re] = n(
    {}
  ), [Se, fe] = n(null), [ye, we] = n({}), [b, V] = n([]), [C, re] = n(""), [ge, Z] = n(""), [he, xe] = n(""), [Ie, Ge] = n(""), [qe, rt] = n({}), [Ye, H] = n(/* @__PURE__ */ new Set()), [Ee, Pe] = n(null), [Fe, ce] = n(24), Be = s(Ie);
  Be.current = Ie;
  const [Ne, He] = n([]), [st, Je] = n([]), [$e, dt] = n([]), [ot, De] = n(""), [Oe, lt] = n(!1), [wt, jt] = n(24), [Wn, Fr] = n(24), [Gr, qn] = n(!1), [Is, Wr] = n(!1), [$s, qr] = n([]), [As, Hr] = n(!1), [zs, Jr] = n([]), [Rs, Vr] = n(!1), [Ps, Kr] = n(!1), [Xr, Os] = n([]), [Yr, Ms] = n(
    []
  ), [Hn, Qr] = n(!1), [Zr, ea] = n(""), [yt, ta] = n(""), [na, Ls] = n([]), [ra, Bs] = n([]), [Jn, aa] = n(!1), [ia, sa] = n(""), [ht, oa] = n(""), [Vn, la] = n(!1), [Qe, gn] = n(null), [Nt, js] = n([]), Ut = s(null), Kn = s(0), Dt = s(0);
  r(() => {
    let w = !0;
    return hc().then((oe) => {
      w && le(oe);
    }).catch(() => {
    }), Ec("zh").then((oe) => {
      w && Q(oe);
    }).catch(() => {
    }), pn().then((oe) => {
      w && (V(oe), oe.length > 0 && (re(oe[0].id), Ge(oe[0].id)));
    }).catch(() => {
    }), () => {
      w = !1;
    };
  }, []);
  const Ft = i(
    async (w) => {
      const oe = ++Dt.current, se = w ?? oc();
      if (He(w || se), se.filter((Me) => Me.enabled).length === 0) {
        Je([]), qn(!1);
        return;
      }
      qn(!0);
      try {
        const { skills: Me, errors: Le } = await pc(se);
        if (oe !== Dt.current) return;
        if (Je(Me), Le.length > 0) {
          for (const je of Le)
            console.warn(
              `[ugsci] GitHub source '${je.label}' error: ${je.message}`
            );
          m.warning(
            `部分源加载失败: ${Le.map((je) => je.label).join(", ")}`
          );
        }
      } catch (Me) {
        if (oe !== Dt.current) return;
        m.error(Me.message || "加载技能源失败");
      } finally {
        oe === Dt.current && qn(!1);
      }
    },
    []
  ), mt = i(async (w = !1) => {
    const oe = ++Kn.current, se = () => oe === Kn.current;
    Qr(!0), aa(!0), lt(!0), await Promise.allSettled([
      uc(w).then((_e) => {
        se() && (Os(_e.servers), Ms(_e.categories), ea(""));
      }).catch(() => {
        se() && ea("MCP 目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        se() && Qr(!1);
      }),
      Vi(w).then((_e) => {
        se() && (Ls(_e.agents), Bs(_e.categories), sa(""));
      }).catch(() => {
        se() && sa("人才目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        se() && aa(!1);
      }),
      mc(w).then((_e) => {
        se() && (dt(_e.skills), js(_e.categories), De(""));
      }).catch(() => {
        se() && De("技能目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        se() && lt(!1);
      })
    ]);
  }, []);
  r(() => {
    Ft(), mt(), qr(ac()), Jr(ic());
    const w = nc(() => {
      mt();
    });
    return () => {
      w(), Kn.current += 1, Dt.current += 1;
    };
  }, [Ft, mt]), r(() => {
    jt(24);
  }, [X, me]), r(() => {
    Fr(24);
  }, [ge, ht]);
  const fn = i(
    async (w, oe, se) => {
      Y(!0);
      try {
        const _e = await bc(
          w,
          se,
          20,
          "zh",
          oe || void 0
        );
        se === void 0 || Object.keys(se).length === 0 ? ee(_e.results) : ee((je) => [...je, ..._e.results]);
        const Me = Object.values(_e.by_provider || {}).some(
          (je) => je.has_more
        );
        ke(Me);
        const Le = {};
        for (const [je, ut] of Object.entries(_e.by_provider || {}))
          Le[je] = (se[je] || 1) + 1;
        if (Re(Le), _e.errors.length > 0)
          for (const je of _e.errors)
            console.warn(
              `[ugsci] Market provider '${je.provider}' error: ${je.message}`
            );
      } catch (_e) {
        m.error(_e.message || "搜索市场失败"), ee([]);
      } finally {
        Y(!1);
      }
    },
    []
  );
  r(() => (Ut.current && clearTimeout(Ut.current), Ut.current = setTimeout(() => {
    fn(X, me, {});
  }, 400), () => {
    Ut.current && clearTimeout(Ut.current);
  }), [X, me, fn]);
  const Ns = () => {
    fn(X, me, Ae);
  }, ca = async (w) => {
    const oe = `${w.source}:${w.slug}`;
    try {
      we((_e) => ({ ..._e, [oe]: "installing" }));
      const se = await Ra(w.source_url);
      se.installed && m.success(
        `技能「${se.name || w.name}」已安装到技能池，可在技能中心查看`
      ), we((_e) => {
        const Me = { ..._e };
        return delete Me[oe], Me;
      });
    } catch (se) {
      m.error(za(se) || "安装技能失败"), we((_e) => {
        const Me = { ..._e };
        return delete Me[oe], Me;
      });
    }
  }, Us = (w) => {
    window.history.pushState({}, "", w), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ds = async (w) => {
    const oe = `github:${w.sourceId}:${w.name}`, se = Ne.find((Me) => Me.id === w.sourceId), _e = (se == null ? void 0 : se.accessToken) || void 0;
    try {
      we((Le) => ({ ...Le, [oe]: "installing" }));
      const Me = await Ra(w.source_url, _e);
      Me.installed && m.success(
        `技能「${Me.name || w.name}」已安装到技能池，可在技能中心查看`
      ), we((Le) => {
        const je = { ...Le };
        return delete je[oe], je;
      });
    } catch (Me) {
      m.error(za(Me) || "安装技能失败"), we((Le) => {
        const je = { ...Le };
        return delete je[oe], je;
      });
    }
  }, xt = a(() => {
    const w = [], oe = /* @__PURE__ */ new Set();
    for (const se of [...$e, ...st]) {
      const _e = se.source_url || `${se.sourceLabel}:${se.name}`;
      oe.has(_e) || (oe.add(_e), w.push(se));
    }
    return w;
  }, [$e, st]), da = a(() => {
    const w = [], oe = /* @__PURE__ */ new Set();
    if (Nt.length > 0)
      for (const se of Nt)
        oe.has(se.id) || (oe.add(se.id), w.push(se));
    for (const se of xt)
      se.tag && !oe.has(se.tag) && (oe.add(se.tag), w.push({ id: se.tag, label: se.tag }));
    for (const se of xt)
      !se.isOfficial && se.sourceLabel && !oe.has(se.sourceLabel) && (oe.add(se.sourceLabel), w.push({ id: se.sourceLabel, label: se.sourceLabel }));
    return w;
  }, [xt, Nt]), St = a(() => {
    let w = xt;
    if (me) {
      const oe = Nt.find(
        (se) => se.id === me
      );
      oe && oe.tags ? w = w.filter(
        (se) => se.tag && oe.tags.includes(se.tag) || se.sourceLabel === me
      ) : w = w.filter(
        (se) => se.tag === me || se.sourceLabel === me
      );
    }
    if (X.trim()) {
      const oe = X.toLowerCase();
      w = w.filter(
        (se) => {
          var _e;
          return se.name.toLowerCase().includes(oe) || ((_e = se.description) == null ? void 0 : _e.toLowerCase().includes(oe));
        }
      );
    }
    return w;
  }, [xt, X, me, Nt]), ua = ue.filter((w) => w.available), kt = a(() => me ? W.filter((w) => {
    const oe = ua.find((se) => se.key === w.source);
    return (oe == null ? void 0 : oe.label) === me;
  }) : W, [W, me, ua]), Fs = U === "skills" ? t.createElement(
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
        prefix: G ? t.createElement(G) : void 0,
        value: X,
        onChange: (w) => D(w.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      t.createElement(
        B,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      t.createElement(
        c,
        {
          icon: N ? t.createElement(N) : void 0,
          onClick: () => Wr(!0),
          size: "small"
        },
        "配置技能源"
      ),
      t.createElement(
        c,
        {
          size: "small",
          loading: Oe,
          onClick: () => {
            mt(!0), Ft();
          }
        },
        "刷新技能目录"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    ot ? t.createElement(T, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络后点击“刷新技能目录”重试，已加载的技能仍可浏览。",
      style: { marginBottom: 12 }
    }) : null,
    da.length > 0 ? t.createElement(
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
        B,
        {
          type: "secondary",
          style: { fontSize: 12, marginRight: 4 }
        },
        "分类:"
      ),
      t.createElement(
        h,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: me === "" ? "blue" : void 0,
          onClick: () => ve("")
        },
        "全部"
      ),
      ...da.map((w) => {
        const oe = st.some(
          (se) => !se.isOfficial && se.sourceLabel === w.id
        );
        return t.createElement(
          h,
          {
            key: w.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: me === w.id ? oe ? "blue" : "geekblue" : void 0,
            icon: oe && N ? t.createElement(N) : void 0,
            onClick: () => ve(
              me === w.id ? "" : w.id
            )
          },
          w.label
        );
      })
    ) : null,
    // GitHub skills section
    (Gr || Oe) && xt.length === 0 ? t.createElement(
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
    ) : St.length > 0 ? t.createElement(
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
        N ? t.createElement(N, {
          style: { fontSize: 14, color: "var(--app-action-link)" }
        }) : null,
        t.createElement(
          B,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${St.length})`
        )
      ),
      t.createElement(
        u,
        { gutter: [12, 12] },
        ...St.slice(0, wt).map((w) => {
          const oe = `github:${w.sourceId}:${w.name}`, se = ye[oe];
          return t.createElement(
            p,
            { key: oe, xs: 24, sm: 12, md: 8, lg: 6 },
            t.createElement(
              E,
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
                N ? t.createElement(N, {
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
                  y,
                  { title: w.name },
                  t.createElement(
                    B,
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
                    w.name
                  )
                )
              ),
              t.createElement(
                O,
                {
                  type: "secondary",
                  style: {
                    fontSize: 11,
                    margin: 0,
                    lineHeight: 1.4
                  },
                  ellipsis: { rows: 2 }
                },
                w.description || "暂无描述"
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
                  w.sourcePath || w.sourceLabel ? t.createElement(
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
                    J ? t.createElement(J, {
                      style: { fontSize: 10 }
                    }) : null,
                    w.sourcePath || w.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  w.tag ? t.createElement(
                    h,
                    {
                      color: "geekblue",
                      style: { fontSize: 10 }
                    },
                    w.tag
                  ) : null,
                  w.version ? t.createElement(
                    h,
                    { style: { fontSize: 10 } },
                    `v${w.version}`
                  ) : null
                ),
                se ? t.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: S ? t.createElement(S) : void 0
                  },
                  "安装中"
                ) : t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: _ ? t.createElement(_) : void 0,
                    onClick: () => Ds(w)
                  },
                  "安装"
                )
              )
            )
          );
        })
      )
    ) : null,
    St.length > wt ? t.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 20 } },
      t.createElement(
        c,
        {
          onClick: () => jt((w) => w + 24)
        },
        `显示更多技能（已显示 ${Math.min(
          wt,
          St.length
        )} / ${St.length}）`
      )
    ) : null,
    // Market results section title
    kt.length > 0 || de ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      I ? t.createElement(I, {
        style: { fontSize: 14, color: "var(--app-action-link)" }
      }) : null,
      t.createElement(
        B,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${kt.length > 0 ? ` (${kt.length})` : ""}`
      )
    ) : null,
    // Results grid
    de && kt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(l, { size: "large" })
    ) : kt.length === 0 ? t.createElement(o, {
      description: X ? `未找到匹配「${X}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...kt.map((w) => {
        const oe = `${w.source}:${w.slug}`, se = ye[oe];
        return t.createElement(
          p,
          { key: oe, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => fe(w)
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
              w.icon_url ? t.createElement("img", {
                src: w.icon_url,
                alt: w.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              t.createElement(
                y,
                { title: w.name },
                t.createElement(
                  B,
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
                  w.name
                )
              )
            ),
            t.createElement(
              O,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              w.description || "暂无描述"
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
                  h,
                  { color: "geekblue", style: { fontSize: 10 } },
                  w.source
                ),
                w.version ? t.createElement(
                  h,
                  { style: { fontSize: 10 } },
                  `v${w.version}`
                ) : null
              ),
              se ? t.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: S ? t.createElement(S) : void 0
                },
                "安装中"
              ) : t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: _ ? t.createElement(_) : void 0,
                  onClick: (_e) => {
                    _e.stopPropagation(), ca(w);
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
    be && !de ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: Ns, loading: de },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    Se ? t.createElement(
      x,
      {
        title: t.createElement(
          "div",
          {
            style: { display: "flex", alignItems: "center", gap: 8 }
          },
          Se.icon_url ? t.createElement("img", {
            src: Se.icon_url,
            alt: Se.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : t.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          t.createElement("span", null, Se.name)
        ),
        open: !0,
        onClose: () => fe(null),
        width: 480,
        extra: t.createElement(
          c,
          {
            type: "primary",
            icon: _ ? t.createElement(_) : void 0,
            onClick: () => {
              ca(Se);
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
          Se.source
        ),
        t.createElement(
          v.Item,
          { label: "描述" },
          Se.description || "-"
        ),
        Se.version ? t.createElement(
          v.Item,
          { label: "版本" },
          Se.version
        ) : null,
        Se.author ? t.createElement(
          v.Item,
          { label: "作者" },
          Se.author
        ) : null,
        t.createElement(
          v.Item,
          { label: "来源链接" },
          t.createElement(
            "a",
            { href: Se.source_url, target: "_blank" },
            Se.source_url
          )
        )
      ),
      Se.stats ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          B,
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
          ...Object.entries(Se.stats).map(
            ([w, oe]) => t.createElement(
              "div",
              { key: w, style: { textAlign: "center" } },
              t.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--app-action-link)"
                  }
                },
                String(oe)
              ),
              t.createElement(
                B,
                { type: "secondary", style: { fontSize: 11 } },
                w
              )
            )
          )
        )
      ) : null
    ) : null
  ) : null, _t = a(() => {
    let w = na;
    if (ht && (w = w.filter((oe) => oe.category === ht)), ge.trim()) {
      const oe = ge.toLowerCase();
      w = w.filter(
        (se) => se.name.toLowerCase().includes(oe) || se.description.toLowerCase().includes(oe) || se.tags.some((_e) => _e.toLowerCase().includes(oe))
      );
    }
    return w;
  }, [na, ge, ht]), Gs = async (w) => {
    if (!Vn) {
      la(!0);
      try {
        const [oe, se] = await Promise.all([
          w.instructions ? (async () => {
            const Me = await on(
              w.instructions.replace(/^\/+/, "")
            );
            if (!Me.ok)
              throw new Error("专家提示词加载失败，请重试后再创建");
            const Le = await Me.text();
            if (!Le.trim()) throw new Error("专家提示词为空，无法创建");
            return Le;
          })() : Promise.resolve(w.description),
          w.skills_manifest ? (async () => {
            const Me = await on(
              w.skills_manifest.replace(/^\/+/, "")
            );
            if (!Me.ok)
              throw new Error("专家技能清单加载失败，请重试后再创建");
            const Le = await Me.json(), je = Array.isArray(Le) ? Le : Le.skills;
            if (!Array.isArray(je)) throw new Error("专家技能清单格式无效");
            return je.map(
              (ut) => typeof ut == "string" ? ut : ut == null ? void 0 : ut.name
            ).filter((ut) => typeof ut == "string" && ut.trim());
          })() : Promise.resolve([])
        ]), _e = await pe("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: w.name,
            description: w.description,
            skill_names: se
          })
        });
        await At(_e.id, "AGENTS.md", oe), m.success(`专家「${w.name}」创建成功，已跳转至专家`), Us("/ugsci-experts");
      } catch (oe) {
        m.error(oe.message || "创建专家失败");
      } finally {
        la(!1);
      }
    }
  }, ma = i(async (w) => {
    if (w)
      try {
        const oe = await Cr(w);
        if (Be.current !== w) return;
        rt(
          Object.fromEntries(oe.map((se) => [se.key, se]))
        );
      } catch {
        Be.current === w && rt({});
      }
  }, []);
  r(() => {
    rt({}), H(/* @__PURE__ */ new Set()), Ie && ma(Ie);
  }, [Ie, ma]), r(() => {
    ce(24);
  }, [he, yt]);
  const Ws = (w) => {
    if (!Ie) {
      m.warning("请先选择目标专家");
      return;
    }
    Pe({
      template: w,
      agentId: Ie,
      existing: qe[w.id]
    });
  }, Ct = a(() => {
    let w = Xr;
    if (yt && (w = w.filter((oe) => oe.category === yt)), he.trim()) {
      const oe = he.toLowerCase();
      w = w.filter(
        (se) => se.name.toLowerCase().includes(oe) || se.description.toLowerCase().includes(oe) || se.tags.some((_e) => _e.toLowerCase().includes(oe))
      );
    }
    return w.map(rc);
  }, [Xr, he, yt]), qs = U === "mcp" ? t.createElement(
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
        prefix: G ? t.createElement(G) : void 0,
        value: he,
        onChange: (w) => xe(w.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        t.createElement(
          B,
          {
            type: "secondary",
            style: { fontSize: 12, whiteSpace: "nowrap" }
          },
          "安装到："
        ),
        t.createElement(f, {
          value: Ie,
          onChange: (w) => Ge(w),
          style: { minWidth: 180 },
          size: "small",
          options: b.map((w) => ({ value: w.id, label: w.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        c,
        {
          icon: J ? t.createElement(J) : void 0,
          onClick: () => Hr(!0),
          size: "small"
        },
        "配置 MCP 源"
      ),
      t.createElement(
        c,
        {
          size: "small",
          loading: Hn,
          onClick: () => mt(!0)
        },
        "刷新目录"
      )
    ),
    Zr ? t.createElement(T, {
      type: "warning",
      showIcon: !0,
      message: Zr,
      style: { marginBottom: 12 }
    }) : null,
    // Dynamic category tag row (from OSS manifest tag_groups)
    Yr.length > 0 ? t.createElement(
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
        B,
        {
          type: "secondary",
          style: { fontSize: 12, marginRight: 4 }
        },
        "分类:"
      ),
      t.createElement(
        h,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: yt === "" ? "blue" : void 0,
          onClick: () => ta("")
        },
        "全部"
      ),
      ...Yr.map(
        (w) => t.createElement(
          h,
          {
            key: w.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: yt === w.id ? "geekblue" : void 0,
            onClick: () => ta(
              yt === w.id ? "" : w.id
            )
          },
          w.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    Hn && Ct.length === 0 ? t.createElement(
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
    ) : Ct.length === 0 ? t.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...Ct.slice(0, Fe).map(
        (w, oe) => {
          var se, _e, Me;
          return t.createElement(
            p,
            { key: w.id, xs: 24, sm: 12, md: 8 },
            t.createElement(
              E,
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
                  w.iconUrl ? t.createElement("img", {
                    src: w.iconUrl,
                    alt: w.name,
                    width: 28,
                    height: 28,
                    decoding: "async",
                    loading: oe < 12 ? "eager" : "lazy",
                    style: {
                      width: 28,
                      height: 28,
                      objectFit: "contain"
                    },
                    onError: (Le) => {
                      Le.target.style.display = "none";
                    }
                  }) : w.emoji
                ),
                t.createElement(
                  "div",
                  { style: { flex: 1 } },
                  t.createElement(
                    B,
                    { strong: !0, style: { fontSize: 14 } },
                    w.name
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
                      h,
                      { color: "blue", style: { fontSize: 10 } },
                      w.category
                    ),
                    t.createElement(
                      h,
                      {
                        color: w.transport === "stdio" ? "purple" : "cyan",
                        style: { fontSize: 10 }
                      },
                      w.transport
                    ),
                    w.authType === "oauth2" ? t.createElement(
                      h,
                      {
                        color: "geekblue",
                        style: { fontSize: 10 }
                      },
                      "账号登录授权"
                    ) : null,
                    w.env && Object.values(w.env).some(
                      (Le) => Le.startsWith("your-") || Le.includes("${")
                    ) ? t.createElement(
                      h,
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
                O,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 3 }
                },
                w.description
              ),
              (se = w.requirements) != null && se.length || (_e = w.limitations) != null && _e.length ? t.createElement(
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
                  ...w.requirements || [],
                  ...w.limitations || []
                ].map(
                  (Le, je) => t.createElement(
                    "p",
                    { key: je, style: { margin: "6px 0" } },
                    Le
                  )
                ),
                bt(w.source) ? t.createElement(
                  "a",
                  {
                    href: bt(w.source),
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
                  B,
                  { type: "secondary", style: { fontSize: 11 } },
                  Ye.has(w.id) ? "已连接 · 工具检测通过" : qe[w.id] ? w.authType === "oauth2" && !((Me = qe[w.id].oauth_status) != null && Me.authorized) ? "已保存 · 待登录授权" : "已保存 · 连接待检测" : w.transport === "stdio" ? `${w.command} ${(w.args || []).join(" ")}` : w.authType === "oauth2" ? "浏览器登录 · 自动检测连接" : "远程服务 · 按账号权限连接"
                ),
                t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: J ? t.createElement(J) : void 0,
                    onClick: () => Ws(w)
                  },
                  qe[w.id] ? "管理连接" : w.transport === "stdio" ? "添加工具" : "连接"
                )
              )
            )
          );
        }
      )
    ),
    Ct.length > Fe ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: () => ce((w) => w + 24) },
        `加载更多 MCP（已显示 ${Math.min(
          Fe,
          Ct.length
        )} / ${Ct.length}）`
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
      I ? t.createElement(I, {
        style: {
          fontSize: 24,
          color: "var(--app-card-muted, #bfbfbf)",
          marginBottom: 8
        }
      }) : null,
      t.createElement(
        B,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ) : null, Hs = Ee ? t.createElement(fc, {
    key: `${Ee.agentId}:${Ee.template.id}`,
    template: Ee.template,
    agentId: Ee.agentId,
    agentName: ((pa = b.find((w) => w.id === Ee.agentId)) == null ? void 0 : pa.name) || Ee.agentId,
    existing: Ee.existing,
    onSaved: (w) => {
      Be.current === Ee.agentId && (rt((oe) => ({ ...oe, [w.key]: w })), H((oe) => {
        const se = new Set(oe);
        return se.delete(w.key), se;
      }));
    },
    onConnected: () => {
      Be.current === Ee.agentId && H((w) => new Set(w).add(Ee.template.id));
    },
    onClose: () => Pe(null)
  }) : null, Js = U === "experts" ? t.createElement(
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
        prefix: G ? t.createElement(G) : void 0,
        value: ge,
        onChange: (w) => Z(w.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        c,
        {
          icon: j ? t.createElement(j) : void 0,
          onClick: () => Vr(!0),
          size: "small"
        },
        "配置专家源"
      ),
      t.createElement(
        c,
        {
          size: "small",
          loading: Jn,
          onClick: () => mt(!0)
        },
        "刷新人才目录"
      ),
      t.createElement(
        c,
        {
          type: "primary",
          size: "small",
          onClick: () => Kr(!0)
        },
        "发布 / 更新专家"
      )
    ),
    ia ? t.createElement(T, {
      type: "warning",
      showIcon: !0,
      message: ia,
      style: { marginBottom: 12 }
    }) : null,
    // Dynamic category tag row (from OSS manifest tag_groups)
    ra.length > 0 ? t.createElement(
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
        B,
        {
          type: "secondary",
          style: { fontSize: 12, marginRight: 4 }
        },
        "分类:"
      ),
      t.createElement(
        h,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: ht === "" ? "blue" : void 0,
          onClick: () => oa("")
        },
        "全部"
      ),
      ...ra.map(
        (w) => t.createElement(
          h,
          {
            key: w.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: ht === w.id ? "geekblue" : void 0,
            onClick: () => oa(
              ht === w.id ? "" : w.id
            )
          },
          w.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Jn && _t.length === 0 ? t.createElement(
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
    ) : _t.length === 0 ? t.createElement(o, {
      description: "未找到匹配的人才",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ..._t.slice(0, Wn).map(
        (w) => t.createElement(
          p,
          { key: w.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => gn(w)
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
              t.createElement(it, {
                name: w.name,
                size: 40
              }),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  B,
                  { strong: !0, style: { fontSize: 14 } },
                  w.name
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
                  w.category ? t.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    Ot(w.category)
                  ) : null,
                  w.tags.includes("mcp") ? t.createElement(
                    h,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            t.createElement(
              O,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              w.description
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
                B,
                { type: "secondary", style: { fontSize: 11 } },
                w.tags.filter(
                  (oe) => oe !== "agent" && oe !== "template" && oe !== "workspace"
                ).slice(0, 3).join(" · ") || "人才模板"
              ),
              t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: q ? t.createElement(q) : void 0
                },
                "查看详情"
              )
            )
          )
        )
      )
    ),
    _t.length > Wn ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        {
          onClick: () => Fr((w) => w + 24)
        },
        `显示更多人才（已显示 ${Math.min(
          Wn,
          _t.length
        )} / ${_t.length}）`
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
      I ? t.createElement(I, {
        style: {
          fontSize: 24,
          color: "var(--app-card-muted, #bfbfbf)",
          marginBottom: 8
        }
      }) : null,
      t.createElement(
        B,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ) : null, Vs = [
    {
      key: "skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        $ ? t.createElement($, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Fs
    },
    {
      key: "mcp",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        J ? t.createElement(J, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: qs
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        q ? t.createElement(q, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Js
    }
  ];
  return t.createElement(
    "div",
    { className: "ugsci-marketplace", style: { padding: 24 } },
    e ? null : t.createElement(Bn, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          c,
          {
            type: "primary",
            icon: F ? t.createElement(F) : void 0,
            onClick: () => {
              fn(X, me, {}), Ft(), mt(!0);
            },
            loading: de || Gr || Oe || Hn || Jn
          },
          "刷新"
        )
      )
    }),
    t.createElement(k, {
      items: Vs,
      activeKey: U,
      onChange: (w) => ie(w)
    }),
    // Skill source config modal
    t.createElement(gc, {
      open: Is,
      onClose: () => Wr(!1),
      sources: Ne,
      onChange: (w) => {
        He(w), Ft(w);
      }
    }),
    // MCP source config modal
    t.createElement(Aa, {
      open: As,
      onClose: () => Hr(!1),
      sources: $s,
      onChange: (w) => qr(w),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Hs,
    // Expert source config modal
    t.createElement(yc, {
      open: Ps,
      onClose: () => {
        Kr(!1), mt();
      }
    }),
    t.createElement(Aa, {
      open: Rs,
      onClose: () => Vr(!1),
      sources: zs,
      onChange: (w) => Jr(w),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Qe ? t.createElement(
      A,
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
          t.createElement(it, {
            name: Qe.name,
            size: 40
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              B,
              { strong: !0, style: { fontSize: 16 } },
              Qe.name
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
              Qe.category ? t.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                Ot(Qe.category)
              ) : null,
              ...Qe.tags.filter(
                (w) => w !== "agent" && w !== "template" && w !== "workspace"
              ).slice(0, 5).map(
                (w) => t.createElement(
                  h,
                  { key: w, style: { fontSize: 10 } },
                  w
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => gn(null),
        width: 640,
        footer: t.createElement(
          "div",
          { style: { textAlign: "right" } },
          t.createElement(
            c,
            {
              onClick: () => gn(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          t.createElement(
            c,
            {
              type: "primary",
              loading: Vn,
              disabled: Vn,
              icon: q ? t.createElement(q) : void 0,
              style: nt,
              onClick: async () => {
                await Gs(Qe), gn(null);
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
          B,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        t.createElement(
          O,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Qe.description
        )
      ),
      // Skills manifest hint
      Qe.skills_manifest ? t.createElement(
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
          B,
          { style: { fontSize: 12, color: "var(--app-card-success-fg)" } },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      Qe.instructions ? t.createElement(
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
          B,
          { style: { fontSize: 12, color: "var(--app-action-link)" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Qe.drivers && Object.keys(Qe.drivers).length > 0 ? t.createElement(
        "div",
        null,
        t.createElement(
          B,
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
          ...Object.entries(Qe.drivers).map(
            ([w, oe]) => t.createElement(
              h,
              { key: w, color: "cyan", style: { fontSize: 11 } },
              `${w}${oe && oe.length > 0 ? ` (${oe.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function wc() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Pa = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Oa = {
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
function xc() {
  const e = P(), t = e.React, { useEffect: n, useRef: r } = t, i = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, a = (i == null ? void 0 : i.id) || "default", s = r(null), l = r(null);
  return n(() => {
    if (s.current === a) return;
    s.current = a, wr();
    const o = wc(), d = Pa[o] || Pa.en, c = Oa[o] || Oa.en;
    let m = !1;
    return (async () => {
      var u, p;
      try {
        const E = await jn(a);
        if (m) return;
        const h = fi(E);
        if (l.current) {
          try {
            l.current();
          } catch {
          }
          l.current = null;
        }
        const y = window.QwenPaw;
        (u = y == null ? void 0 : y.chat) != null && u.welcome && (h.length > 0 ? (l.current = y.chat.welcome.set("ugsci", {
          description: d,
          prompts: h
        }), console.info(
          `[ugsci] Injected ${h.length} welcome prompts for agent "${a}"`
        )) : (l.current = y.chat.welcome.set("ugsci", {
          description: d,
          prompts: [c]
        }), console.info(
          `[ugsci] No skills for agent "${a}" — using default prompt`
        )));
      } catch (E) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${a}":`,
          E
        );
        const h = window.QwenPaw;
        if ((p = h == null ? void 0 : h.chat) != null && p.welcome && !m) {
          if (l.current) {
            try {
              l.current();
            } catch {
            }
            l.current = null;
          }
          l.current = h.chat.welcome.set("ugsci", {
            description: d,
            prompts: [c]
          });
        }
      }
    })(), () => {
      m = !0;
    };
  }, [a]), null;
}
const Sc = 256;
let Ke = {};
const mr = /* @__PURE__ */ new Set(), $n = () => mr.forEach((e) => e()), kc = (e) => (mr.add(e), () => mr.delete(e)), ln = /* @__PURE__ */ new Map();
function Ma(e, t) {
  const n = [];
  for (const a of t) {
    if (!a) continue;
    const s = Ke[Mt(e, a)] || Object.values(Ke).find((l) => l.uiId === a);
    s && n.push(s);
  }
  const r = `${e}::${t.join("\0")}`, i = ln.get(r);
  return i && i.length === n.length && i.every((a, s) => a === n[s]) ? i : (ln.set(r, n), n);
}
function Mt(e, t) {
  return `${e}::${t}`;
}
function An(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? An(e.genui) : e.ui && typeof e.ui == "object" ? An(e.ui.genui) : null;
}
function Zt(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, i = typeof r == "string" ? Zt(r) : An(n);
        if (i) return i;
      }
      return null;
    }
    return An(t);
  } catch {
    return null;
  }
}
function en(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const n = JSON.parse(e);
    if (Array.isArray(n)) {
      const r = (t = n.find((i) => (i == null ? void 0 : i.type) === "text")) == null ? void 0 : t.text;
      return typeof r == "string" ? en(r) : null;
    }
    return n && n.ok === !1 ? n : null;
  } catch {
    return null;
  }
}
const La = /* @__PURE__ */ new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output"
]), Yn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function Ki(e) {
  var r, i, a, s;
  if (!Array.isArray(e)) return [];
  const t = [], n = (l, o = !1) => {
    var m, u, p;
    if (!l || typeof l != "object") return;
    if (Array.isArray(l)) {
      const E = o ? l.map((h) => {
        var y;
        return ((y = h == null ? void 0 : h.data) == null ? void 0 : y.name) ?? (h == null ? void 0 : h.name);
      }).filter((h) => !!h).map((h) => String(h)) : [];
      if (o && E.length) {
        const h = E.some(
          (y) => Yn.has(y)
        );
        for (const y of l) {
          const g = ((m = y == null ? void 0 : y.data) == null ? void 0 : m.output) ?? (y == null ? void 0 : y.output) ?? ((u = y == null ? void 0 : y.data) == null ? void 0 : u.result) ?? (y == null ? void 0 : y.result) ?? ((p = y == null ? void 0 : y.data) == null ? void 0 : p.content) ?? (y == null ? void 0 : y.content);
          if (g == null) continue;
          const f = typeof g == "string" ? g : JSON.stringify(g), x = Zt(f) || (h ? en(f) : null);
          x && t.push(x);
        }
      }
      l.forEach((h) => n(h));
      return;
    }
    const d = l;
    if (d.type === "tool_result") {
      const h = (Array.isArray(d.output) ? d.output : []).filter((f) => (f == null ? void 0 : f.type) === "text").map((f) => f.text), y = h.length ? h.join(`
`) : d.output, g = h.length ? h : [typeof y == "string" ? y : JSON.stringify(y)];
      for (const f of g) {
        const x = Zt(f) || (Yn.has(String(d.name || "")) ? en(f) : null);
        x && t.push(x);
      }
      return;
    }
    const c = La.has(String(d.type || ""));
    Object.entries(d).forEach(
      ([E, h]) => n(h, c && E === "content")
    );
  };
  n(e);
  for (const l of e) {
    if (!l || typeof l != "object") continue;
    const o = l;
    if (!La.has(String(o.type || "")) || !Array.isArray(o.content))
      continue;
    const d = o.content, c = (i = (r = d[0]) == null ? void 0 : r.data) == null ? void 0 : i.name;
    if (!c) continue;
    const m = (s = (a = d[1]) == null ? void 0 : a.data) == null ? void 0 : s.output;
    if (m == null) continue;
    const u = typeof m == "string" ? m : JSON.stringify(m), p = Zt(u) || (Yn.has(String(c)) ? en(u) : null);
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
function Xi(e) {
  var s;
  const t = Mt(e.sessionId, e.uiId), n = Object.entries(Ke).filter(([, l]) => l.uiId === e.uiId).sort(([, l], [, o]) => o.revision - l.revision), r = Ke[t] || ((s = n[0]) == null ? void 0 : s[1]);
  if (r && e.revision < r.revision) return;
  const i = { ...Ke };
  for (const [l] of n) l !== t && delete i[l];
  i[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const a = Object.entries(i).sort(
    ([, l], [, o]) => o.updatedAt - l.updatedAt
  );
  Ke = Object.fromEntries(a.slice(0, Sc)), $n();
}
function _c(e, t) {
  for (const n of Ki(t))
    !n.ui_id || !n.tree || Xi({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const Yi = {
  setSnapshot: Xi,
  applyPatch(e, t, n, r) {
    var d, c;
    const i = (d = window.QwenPaw) == null ? void 0 : d.host, a = r || ((c = i == null ? void 0 : i.getCurrentSessionId) == null ? void 0 : c.call(i)) || "", s = Mt(a, e.ui_id), l = Ke[s] || Object.values(Ke).find((m) => m.uiId === e.ui_id);
    if (!l || n <= l.revision) return;
    Ke = {
      ...Object.fromEntries(
        Object.entries(Ke).filter(
          ([, m]) => m.uiId !== e.ui_id
        )
      ),
      [s]: { ...l, sessionId: a, tree: t, revision: n, updatedAt: Date.now() }
    }, $n();
  },
  getSnapshot: (e, t) => Ke[Mt(e, t)],
  clearSession(e) {
    Ke = Object.fromEntries(
      Object.entries(Ke).filter(
        ([, t]) => t.sessionId !== e
      )
    );
    for (const t of [...ln.keys()])
      t.startsWith(`${e}::`) && ln.delete(t);
    $n();
  },
  hydrateFromMessages: _c
};
function Cc({ children: e }) {
  return e;
}
function Tc() {
  return Yi;
}
function Ic(e, t) {
  var a, s;
  const n = (s = (a = window.QwenPaw) == null ? void 0 : a.host) == null ? void 0 : s.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), i = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    kc,
    () => Ma(e, i),
    () => Ma(e, i)
  );
}
function $c(e) {
  Yi.clearSession(e);
}
function Ac() {
  Ke = {}, ln.clear(), $n();
}
function tn(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return tn(JSON.parse(e));
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
    if (n.output !== void 0) return tn(n.output);
    if (n.content !== void 0) return tn(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function zc(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const i = r[0], a = i == null ? void 0 : i.data, s = (a == null ? void 0 : a.name) || "";
  if (r.length > 1) {
    const l = r[1], o = l == null ? void 0 : l.data, d = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (l == null ? void 0 : l.output) ?? (l == null ? void 0 : l.content) ?? (o == null ? void 0 : o.result) ?? (l == null ? void 0 : l.result);
    if (d != null)
      return { resultText: tn(d), status: n, toolName: s };
  }
  if (a != null && a.output) {
    const l = a.output;
    return { resultText: tn(l), status: n, toolName: s };
  }
  return { resultText: "", status: n, toolName: s };
}
function Ba(e) {
  var p, E, h, y;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: i, toolName: a } = zc(
    e
  ), s = i === "in_progress" || i === "calling", l = i === "failed" || i === "error", o = Zt(r), d = o ? null : en(r);
  let c = 0;
  (E = o == null ? void 0 : o.tree) != null && E.root && (c = Qi(o.tree.root));
  const m = a === "emit_ui_patch" || (o == null ? void 0 : o.kind) === "genui_patch", u = s ? m ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : l ? m ? "📝 UI Patch Error" : "🎨 UI Tree Error" : o ? m ? `📝 UI Patched (rev ${o.revision ?? "?"})` : `🎨 UI Tree (${c} nodes)` : m ? "📝 UI Patch" : "🎨 UI Tree";
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
        `ui_id: ${((h = o.ui_id) == null ? void 0 : h.slice(0, 16)) ?? ""}…`
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
      (y = o.tree) != null && y.root ? `GenUI 已在回复正文中展示（${c} 个节点，revision ${o.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
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
function Qi(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children))
    for (const n of e.children) t += Qi(n);
  return t;
}
function In(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return In(JSON.parse(e));
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
    if (n.output !== void 0) return In(n.output);
    if (n.content !== void 0) return In(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function Rc(e) {
  var s;
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const i = (s = r[0]) == null ? void 0 : s.data, a = (i == null ? void 0 : i.name) || "";
  if (r.length > 1) {
    const l = r[1], o = l == null ? void 0 : l.data, d = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (l == null ? void 0 : l.output) ?? (l == null ? void 0 : l.content);
    if (d != null)
      return { resultText: In(d), status: n, toolName: a };
  }
  return { resultText: "", status: n, toolName: a };
}
function ja(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: i, toolName: a } = Rc(
    e
  ), s = a === "get_genui_guide", l = i === "in_progress" || i === "calling";
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
const Pc = /* @__PURE__ */ new Set(["send_message"]), Na = 1e4, Oc = 500, Ua = {};
function Mc() {
  var e;
  try {
    const t = window.QwenPaw, n = (e = t == null ? void 0 : t.genui) == null ? void 0 : e.config;
    if (n != null && n.allow_actions && Array.isArray(n.allow_actions)) {
      const r = n.allow_actions.filter(
        (i) => typeof i == "string" && i.length > 0
      );
      if (r.length > 0)
        return new Set(r);
    }
  } catch {
  }
  return new Set(Pc);
}
function Lc(e) {
  const t = Date.now(), n = Ua[e] || 0;
  return t - n < Oc ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (Ua[e] = t, !1);
}
function Bc(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const i = t[r];
    return i == null ? "" : typeof i == "string" ? i : JSON.stringify(i);
  });
}
function pr(e, t = {}) {
  var a, s, l, o, d, c, m;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, i = Mc();
  if (!i.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(i).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (Lc(r))
    return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const u = t.formValues || {};
    let p = ((a = n.payload) == null ? void 0 : a.content) || ((s = n.payload) == null ? void 0 : s.message) || "";
    const E = /\{\{\s*[\w.-]+\s*\}\}/.test(p);
    return p = Bc(p, u).trim(), p && !E && Object.keys(u).length > 0 && (p += `
${Object.entries(u).map(
      ([y, g]) => `${y}: ${typeof g == "string" ? g : JSON.stringify(g)}`
    ).join(`
`)}`), !p && Object.keys(u).length > 0 && (p = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(u).map(
      ([g, f]) => `${g}: ${typeof f == "string" ? f : JSON.stringify(f)}`
    ).join(`
`)}`), !p || !p.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : p.length > Na ? (console.warn(
      "[ugsci.genui] send_message: content length " + p.length + " exceeds max " + Na
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
const at = /* @__PURE__ */ new Map(), cn = /* @__PURE__ */ new Map(), jc = 128, wn = /* @__PURE__ */ new Map();
function zn(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function Nc(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function Uc(e) {
  return e.startsWith("workspace://");
}
function Dc(e) {
  return Uc(e) ? e.slice(12) : e;
}
async function Fc(e) {
  if (!e) return null;
  if (zn(e)) return e;
  if (at.has(e))
    return at.get(e) ?? null;
  if (wn.has(e))
    return wn.get(e);
  const t = Gc(e);
  wn.set(e, t);
  try {
    const n = await t;
    if (!at.has(e) && at.size >= jc) {
      const r = at.keys().next().value;
      if (r !== void 0) {
        const i = at.get(r);
        i != null && i.startsWith("blob:") && URL.revokeObjectURL(i), at.delete(r);
      }
    }
    return at.set(e, n), n && cn.delete(e), n;
  } finally {
    wn.delete(e);
  }
}
async function Gc(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const i = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return cn.set(e, i), console.warn("[ugsci.genui]", i), null;
  }
  const r = Dc(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const i = await n.resolveWorkspaceBlob(r);
      if (i) return i;
    } catch (i) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", i);
    }
  try {
    return await Wc(r, n);
  } catch (i) {
    const a = i instanceof Error ? i.message : String(i);
    return cn.set(
      e,
      `无法读取本地媒体：${a}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      i
    ), null;
  }
}
async function Wc(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, i = t == null ? void 0 : t.chatApi;
  if (Nc(e) && (i != null && i.filePreviewUrl) ? n = i.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
    throw new Error(
      "宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl"
    );
  const a = {}, s = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof s == "function")
    try {
      const d = s();
      d && typeof d == "object" && Object.assign(a, d);
    } catch {
    }
  const l = await fetch(n, { headers: a });
  if (!l.ok)
    throw new Error(`HTTP ${l.status}: ${l.statusText}`);
  const o = await l.blob();
  return URL.createObjectURL(o);
}
function Da(e) {
  return e ? zn(e) ? e : at.get(e) ?? null : null;
}
function Fa(e) {
  return cn.get(e) ?? null;
}
function qc() {
  for (const e of at.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  at.clear(), cn.clear();
}
const Zi = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], Tt = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96"
], Hc = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function Ce(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function tt(e) {
  if (typeof e == "number" && Number.isFinite(e)) return e;
  if (typeof e == "string") {
    const t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}
function Kt(e) {
  return Array.isArray(e) ? e : [];
}
function nn(e) {
  return !!e;
}
function dn(e) {
  const t = e.props || {}, n = Ce(t.name);
  if (n) return n;
  const r = Ce(t.label), i = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return i ? i[1].toLowerCase() : r || Ce(e.nodeId);
}
function es(e) {
  return Zi.includes(e);
}
function ts(e) {
  return Math.min(Math.max(tt(e) || 2, 1), 4);
}
function Jc(e, t, n = 6) {
  const r = tt(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function Vc(e) {
  const n = (Ce(e) || "16:9").split(":"), r = Number(n[0]), i = Number(n[1]);
  return r > 0 && i > 0 ? `${r} / ${i}` : "16 / 9";
}
function Kc(e) {
  return /^https?:\/\//i.test(Ce(e).trim());
}
function et(e, t) {
  const n = {}, r = `${tt(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${tt(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = Ce(t.align)), t.justify && (n.justifyContent = Ce(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const i = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, a = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${Jc(
      t.columns,
      i,
      a
    )}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${tt(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${tt(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${tt(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = Vc(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${tt(t.size) || 16}px`);
  return n;
}
function zr(e, t) {
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
  function i(m) {
    return Array.isArray(m) ? m : [];
  }
  const a = e.generator && typeof e.generator == "object" ? e.generator : {}, s = i(a.coefficients).map(n).filter(Boolean), l = n(a.type) === "polynomial" || s.length > 0;
  let o = i(e.categories).map(n), d = i(e.series);
  if (l && t) {
    const m = s.length > 0 ? s : ["a", "b", "c", "d", "e"], u = typeof a.xMin == "number" ? a.xMin : -3, p = typeof a.xMax == "number" ? a.xMax : 3, E = Math.min(
      Math.max(r(a.samples) || 61, 10),
      400
    ), h = Array.from(
      { length: E },
      (g, f) => u + (p - u) * f / Math.max(E - 1, 1)
    ), y = m.map((g) => r(t[g]));
    o = h.map((g) => Number(g.toFixed(2)).toString()), d = [
      {
        name: n(a.label) || "f(x)",
        values: h.map(
          (g) => y.reduce(
            (f, x, v) => f + x * Math.pow(g, y.length - v - 1),
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
      values: i(p.values).map(r)
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
function ns(e, t, n = 640) {
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
  const i = t.height || 240, a = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (a.setAttribute("viewBox", `0 0 ${n} ${i}`), a.setAttribute("role", "img"), a.setAttribute("aria-label", t.title || "Chart"), t.chartType === "pie") {
    const p = t.series[0].values.map((x) => Math.abs(x)), E = p.reduce((x, v) => x + v, 0) || 1, h = n / 2, y = i / 2, g = Math.min(n, i) / 2 - 20;
    let f = -Math.PI / 2;
    if (p.forEach((x, v) => {
      const k = x / E * Math.PI * 2, M = h + g * Math.cos(f), z = y + g * Math.sin(f), A = h + g * Math.cos(f + k), T = y + g * Math.sin(f + k), F = document.createElementNS(a.namespaceURI, "path");
      F.setAttribute(
        "d",
        `M ${h} ${y} L ${M} ${z} A ${g} ${g} 0 ${k > Math.PI ? 1 : 0} 1 ${A} ${T} Z`
      ), F.setAttribute("fill", r[v % r.length]), a.appendChild(F), f += k;
    }), e.appendChild(a), t.showLegend) {
      const x = document.createElement("div");
      x.className = "legend", p.forEach((v, k) => {
        const M = document.createElement("span"), z = document.createElement("i");
        z.style.background = r[k % r.length], M.append(
          z,
          document.createTextNode(
            `${t.categories[k] || `#${k + 1}`}: ${v}`
          )
        ), x.appendChild(M);
      }), e.appendChild(x);
    }
    return;
  }
  const s = t.series.flatMap((p) => p.values), l = Math.max(...s, 0), o = Math.min(...s, 0), d = l - o || 1, c = (p) => i - 24 - (p - o) / d * (i - 44), m = (p) => 30 + p * (n - 50) / Math.max(t.categories.length - 1, 1), u = document.createElementNS(a.namespaceURI, "line");
  if (u.setAttribute("x1", "30"), u.setAttribute("x2", String(n - 15)), u.setAttribute("y1", String(c(0))), u.setAttribute("y2", String(c(0))), u.setAttribute("stroke", "#d9d9d9"), a.appendChild(u), t.series.forEach((p, E) => {
    const h = r[E % r.length];
    if (t.chartType === "bar") {
      const f = (n - 50) / Math.max(t.categories.length, 1), x = Math.max(1, f / t.series.length - 3);
      p.values.forEach((v, k) => {
        const M = document.createElementNS(a.namespaceURI, "rect"), z = Math.min(c(v), c(0)), A = Math.max(c(v), c(0));
        M.setAttribute(
          "x",
          String(30 + k * f + E * (x + 2))
        ), M.setAttribute("y", String(z)), M.setAttribute("width", String(x)), M.setAttribute("height", String(Math.max(1, A - z))), M.setAttribute("fill", h), a.appendChild(M);
      });
      return;
    }
    const y = p.values.map((f, x) => `${m(x)},${c(f)}`).join(" "), g = document.createElementNS(a.namespaceURI, "polyline");
    g.setAttribute("points", y), g.setAttribute(
      "fill",
      t.chartType === "area" ? `${h}22` : "none"
    ), g.setAttribute("stroke", h), g.setAttribute("stroke-width", "2"), a.appendChild(g);
  }), e.appendChild(a), t.showLegend) {
    const p = document.createElement("div");
    p.className = "legend", t.series.forEach((E, h) => {
      const y = document.createElement("span"), g = document.createElement("i");
      g.style.background = r[h % r.length], y.append(g, document.createTextNode(E.name)), p.appendChild(y);
    }), e.appendChild(p);
  }
}
const Xc = {
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
}, Yc = {
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
function rs(e) {
  const t = Ce(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = Yc[n];
  return r ? { kind: "svg", paths: Xc[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function Qc(e, t, n = {}) {
  const r = rs(t), i = n.size && n.size > 0 ? n.size : 16;
  if (e.setAttribute("aria-hidden", "true"), e.replaceChildren(), r.kind === "emoji") {
    e.textContent = r.text, e.style.fontSize = `${i}px`, n.color && (e.style.color = n.color);
    return;
  }
  if (r.kind === "empty") return;
  const a = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  a.setAttribute("width", String(i)), a.setAttribute("height", String(i)), a.setAttribute("viewBox", "0 0 24 24"), a.setAttribute("fill", "none"), a.setAttribute("stroke", n.color || "currentColor"), a.setAttribute("stroke-width", "2"), a.setAttribute("stroke-linecap", "round"), a.setAttribute("stroke-linejoin", "round"), a.setAttribute("focusable", "false"), a.style.display = "block";
  for (const s of r.paths) {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "path");
    l.setAttribute("d", s), a.appendChild(l);
  }
  e.appendChild(a);
}
let Qn = null;
function Un(e) {
  return Qn || (Qn = e.createContext(null)), Qn;
}
function as(e, t = {}) {
  if (es(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[dn(e)] = r);
  }
  for (const n of e.children || []) as(n, t);
  return t;
}
function Zc({
  node: e,
  children: t,
  onValuesChange: n
}) {
  var o, d;
  const r = (d = (o = window.QwenPaw) == null ? void 0 : o.host) == null ? void 0 : d.React;
  if (!r) return null;
  const i = r.useMemo(() => as(e), [e]), [a, s] = r.useState(
    i
  );
  r.useEffect(
    () => s((c) => ({ ...i, ...c })),
    [i]
  ), r.useEffect(() => {
    n == null || n(a);
  }, [a, n]);
  const l = r.useMemo(
    () => ({
      values: a,
      setValue: (c, m) => s((u) => ({
        ...u,
        [c]: m
      }))
    }),
    [a]
  );
  return r.createElement(
    Un(r).Provider,
    { value: l },
    t
  );
}
const te = (e) => typeof e == "string" ? e : e != null ? String(e) : "", pt = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, gt = (e) => !!e, Xt = (e) => Array.isArray(e) ? e : [], ed = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((i) => Object.is(e[i], t[i]));
}, Ga = {
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
}, td = new Set(Zi);
function nd(e) {
  const t = [], n = (r) => {
    td.has(r.kind) && t.push(r);
    for (const i of r.children || []) n(i);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let Zn = null;
function Rr(e) {
  return Zn || (Zn = e.createContext(null)), Zn;
}
function rd({ node: e }) {
  var E;
  const t = (E = window.QwenPaw) == null ? void 0 : E.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const i = e.props || {}, a = n.useContext(Un(n)), [s, l] = n.useState({}), [o, d] = n.useState(
    null
  ), c = n.useMemo(
    () => nd(e),
    [e]
  ), m = n.useMemo(() => {
    const h = {};
    for (const y of c) {
      const g = y.props || {}, f = dn(y);
      g.value !== void 0 ? h[f] = g.value : g.checked !== void 0 && (h[f] = g.checked);
    }
    return h;
  }, [c]);
  n.useEffect(
    () => l((h) => {
      const y = {
        ...m,
        ...h,
        ...(a == null ? void 0 : a.values) || {}
      };
      return ed(h, y) ? h : y;
    }),
    [m, a == null ? void 0 : a.values]
  );
  const u = n.useMemo(
    () => ({
      values: s,
      setValue: (h, y) => {
        d(null), l((g) => ({
          ...g,
          [h]: y
        })), a == null || a.setValue(h, y);
      }
    }),
    [s, a]
  ), p = () => {
    var g, f;
    const h = c.filter((x) => {
      var v;
      return (v = x.props) == null ? void 0 : v.required;
    }).find((x) => {
      const v = dn(x), k = s[v];
      return k == null || k === "" || Array.isArray(k) && k.length === 0;
    });
    if (h) {
      d({
        ok: !1,
        message: `${te((g = h.props) == null ? void 0 : g.label) || te((f = h.props) == null ? void 0 : f.name) || "必填项"}不能为空`
      });
      return;
    }
    const y = i.action && typeof i.action == "object" ? i.action : { type: "submit_form", payload: {} };
    d(
      pr(y, {
        formValues: s,
        formId: te(i.formId) || e.nodeId
      })
    );
  };
  return n.createElement(
    Rr(n).Provider,
    { value: u },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      i.title ? n.createElement(
        "div",
        { style: { fontWeight: 600, marginBottom: 8 } },
        te(i.title)
      ) : null,
      ...(e.children || []).map(
        (h, y) => n.createElement(un(n), {
          key: h.nodeId || y,
          node: h
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
        te(i.submitLabel) || "提交"
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
function ad({
  node: e,
  fieldType: t
}) {
  var g, f, x;
  const n = (g = window.QwenPaw) == null ? void 0 : g.host, r = n == null ? void 0 : n.React, i = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const a = e.props || {}, s = r.useContext(Rr(r)), l = r.useContext(Un(r)), o = s || l, [d, c] = r.useState(
    a.value ?? a.checked ?? ""
  ), m = dn(e), u = a.value ?? a.checked ?? "", p = o ? ((f = o.values) == null ? void 0 : f[m]) ?? u : d, E = (v) => {
    const k = v != null && v.target ? t === "Switch" ? v.target.checked : v.target.value : v;
    o ? o.setValue(m, k) : c(k);
  }, h = (v) => r.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        margin: "4px 0"
      }
    },
    a.label && t !== "Switch" ? r.createElement(
      "label",
      { style: { fontSize: 12, color: ze.muted } },
      te(a.label),
      a.required ? r.createElement(
        "span",
        { style: { color: ze.error } },
        " *"
      ) : null
    ) : null,
    v,
    a.description ? r.createElement(
      "span",
      { style: { fontSize: 11, color: ze.muted } },
      te(a.description)
    ) : null
  ), y = te(a.label) || te(a.placeholder) || m;
  return t === "Input" ? h(
    r.createElement(i.Input || "input", {
      "aria-label": y,
      placeholder: te(a.placeholder),
      value: p,
      onChange: E,
      size: "small"
    })
  ) : t === "NumberInput" ? h(
    r.createElement(i.InputNumber || "input", {
      "aria-label": y,
      value: p,
      min: a.min,
      max: a.max,
      step: a.step,
      onChange: E,
      size: "small",
      style: { width: "100%" }
    })
  ) : t === "Textarea" ? h(
    r.createElement(((x = i.Input) == null ? void 0 : x.TextArea) || "textarea", {
      "aria-label": y,
      placeholder: te(a.placeholder),
      value: p,
      rows: pt(a.rows) || 3,
      onChange: E,
      style: { width: "100%" }
    })
  ) : t === "Select" ? h(
    r.createElement(
      i.Select || "select",
      {
        "aria-label": y,
        placeholder: te(a.placeholder),
        value: p || void 0,
        onChange: E,
        size: "small",
        style: { width: "100%" }
      },
      Xt(a.options).map(
        (v, k) => {
          var M;
          return r.createElement(
            ((M = i.Select) == null ? void 0 : M.Option) || "option",
            {
              key: k,
              value: te(typeof v == "object" ? v.value : v)
            },
            te(typeof v == "object" ? v.label : v)
          );
        }
      )
    )
  ) : t === "Switch" ? r.createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 8 } },
    r.createElement(i.Switch || "input", {
      type: "checkbox",
      checked: !!p,
      onChange: E,
      size: "small"
    }),
    r.createElement("span", null, te(a.label))
  ) : t === "Slider" ? h(
    r.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 8 } },
      r.createElement(i.Slider || "input", {
        type: "range",
        value: pt(p),
        min: a.min ?? 0,
        max: a.max ?? 100,
        step: a.step ?? 1,
        onChange: E,
        style: { flex: 1 }
      }),
      r.createElement(
        "span",
        { style: { minWidth: 32, fontSize: 12 } },
        te(p)
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
    r.createElement("span", null, te(a.label) || "选择文件"),
    r.createElement("input", {
      type: "file",
      multiple: gt(a.multiple),
      accept: te(a.accept) || void 0,
      onChange: (v) => o == null ? void 0 : o.setValue(
        m,
        Array.from(v.target.files || []).map((k) => ({
          name: k.name,
          size: k.size,
          type: k.type
        }))
      )
    })
  ) : null;
}
function er({
  node: e,
  link: t = !1,
  toggle: n = !1
}) {
  var p;
  const r = (p = window.QwenPaw) == null ? void 0 : p.host, i = r == null ? void 0 : r.React, a = (r == null ? void 0 : r.antd) || {};
  if (!i) return null;
  const s = e.props || {}, l = i.useContext(Rr(i)), [o, d] = i.useState(gt(s.checked)), [c, m] = i.useState(
    null
  ), u = () => {
    n && d((E) => !E), s.action && typeof s.action == "object" ? m(
      pr(s.action, {
        formValues: l == null ? void 0 : l.values,
        formId: l ? "form" : void 0
      })
    ) : t && typeof s.href == "string" && m(
      pr({ type: "open_url", payload: { url: s.href } })
    );
  };
  return i.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    i.createElement(
      a.Button || "button",
      {
        type: t ? "link" : (n ? o : te(s.variant) === "primary") ? "primary" : "default",
        size: "small",
        disabled: gt(s.disabled),
        loading: gt(s.loading),
        onClick: u
      },
      te(s.label) || "Action"
    ),
    c ? i.createElement(
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
let Wa = null, xn = null;
function id(e) {
  return xn && Wa === e || (Wa = e, xn = class extends e.Component {
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
  }), xn;
}
function sd({ node: e }) {
  var o;
  const t = (o = window.QwenPaw) == null ? void 0 : o.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, i = un(n), a = e.props || {}, s = e.children || [];
  return ld(
    n,
    r,
    e,
    a,
    s,
    () => s.map(
      (d, c) => n.createElement(i, { key: d.nodeId || c, node: d })
    )
  );
}
let Sn = null, qa = null;
function un(e) {
  return Sn && qa === e || (Sn = e.memo(
    sd,
    (t, n) => t.node === n.node
  ), qa = e), Sn;
}
function od({
  node: e
}) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    id(n),
    { node: e },
    n.createElement(un(n), { node: e })
  );
}
function ld(e, t, n, r, i, a) {
  var s, l;
  switch (n.kind) {
    case "Stack":
      return e.createElement(
        "div",
        { style: et("Stack", r) },
        a()
      );
    case "Row":
      return e.createElement(
        "div",
        { style: et("Row", r) },
        a()
      );
    case "Grid":
      return e.createElement(
        "div",
        { style: et("Grid", r) },
        a()
      );
    case "Spacer":
      return e.createElement("div", { style: et("Spacer", r) });
    case "ScrollArea":
      return e.createElement(
        "div",
        { style: et("ScrollArea", r) },
        a()
      );
    case "AspectBox":
      return e.createElement(
        "div",
        { style: et("AspectBox", r) },
        a()
      );
    case "Text":
      return e.createElement(
        "div",
        {
          style: {
            fontSize: Ga[te(r.size)] || Ga.base,
            color: ze[te(r.color)] || ze.default,
            fontWeight: gt(r.bold) ? "bold" : "normal",
            lineHeight: 1.6
          }
        },
        te(r.value)
      );
    case "Heading": {
      const o = ts(r.level), d = {
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
        te(r.value)
      );
    }
    case "Divider":
      return e.createElement(
        t.Divider || "hr",
        r.label ? { children: te(r.label) } : {}
      );
    case "Markdown": {
      const o = (s = window.QwenPaw) == null ? void 0 : s.host, d = o == null ? void 0 : o.ReactMarkdown;
      if (d) {
        const c = o != null && o.remarkGfm ? [o.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(d, {
            children: te(r.content || r.value),
            remarkPlugins: c
          })
        );
      }
      return e.createElement(
        "div",
        { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } },
        te(r.content || r.value)
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
        te(r.code)
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
        r.icon ? e.createElement("span", { style: { fontSize: 20 } }, te(r.icon)) : null,
        e.createElement(
          "div",
          null,
          e.createElement(
            "div",
            { style: { fontSize: 16, fontWeight: 600 } },
            te(r.title)
          ),
          r.subtitle ? e.createElement(
            "div",
            { style: { fontSize: 12, color: ze.muted } },
            te(r.subtitle)
          ) : null
        )
      );
    case "KeyValueList": {
      const o = Xt(r.items);
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
              te(d.key)
            ),
            e.createElement(
              "span",
              { style: { fontWeight: 500, fontSize: 13 } },
              te(d.value)
            )
          )
        )
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", {
        color: te(r.variant) || "default",
        children: te(r.value)
      });
    case "Tag":
      return e.createElement(t.Tag || "span", {
        color: te(r.color) || "default",
        children: te(r.label)
      });
    case "Stat":
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 2 } },
        e.createElement(
          "span",
          { style: { fontSize: 12, color: ze.muted } },
          te(r.label)
        ),
        e.createElement(
          "span",
          { style: { fontSize: 20, fontWeight: "bold" } },
          te(r.value)
        ),
        r.delta ? e.createElement(
          "span",
          {
            style: {
              fontSize: 12,
              color: te(r.trend) === "up" ? ze.success : te(r.trend) === "down" ? ze.error : ze.muted
            }
          },
          te(r.delta)
        ) : null
      );
    case "Progress":
      return e.createElement(t.Progress || "div", {
        percent: pt(r.value),
        size: "small"
      });
    case "Skeleton": {
      const o = pt(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: o }).map(
          (d, c) => e.createElement(t.Skeleton || "div", {
            key: c,
            active: gt(r.active),
            title: !1,
            paragraph: { rows: 1 }
          })
        )
      );
    }
    case "Avatar":
      return e.createElement(dd, {
        src: te(r.src),
        name: te(r.name),
        size: pt(r.size) || 32
      });
    case "Icon": {
      const o = rs(r.name), d = pt(r.size) || 16, c = ze[te(r.color)] || ze.default;
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
    case "Card":
      return e.createElement(
        t.Card || "div",
        {
          title: r.title ? te(r.title) : void 0,
          size: "small",
          style: { margin: "4px 0" }
        },
        a()
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
              te(r.title)
            ),
            e.createElement(
              "div",
              { style: { fontSize: 24, fontWeight: "bold" } },
              te(r.value)
            )
          ),
          r.icon ? e.createElement(
            "span",
            { style: { fontSize: 32 } },
            te(r.icon)
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
              te(r.title)
            ),
            e.createElement(
              "div",
              { style: { fontSize: 24, fontWeight: "bold" } },
              te(r.value)
            ),
            r.delta ? e.createElement(
              "span",
              {
                style: {
                  fontSize: 12,
                  color: te(r.trend) === "up" ? ze.success : te(r.trend) === "down" ? ze.error : ze.muted
                }
              },
              `${te(r.delta)} ${r.period ? te(r.period) : ""}`.trim()
            ) : null
          ),
          r.icon ? e.createElement(
            "span",
            { style: { fontSize: 32 } },
            te(r.icon)
          ) : null
        )
      );
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", {
        type: te(r.severity) === "success" ? "success" : te(r.severity) === "warning" ? "warning" : te(r.severity) === "error" ? "error" : "info",
        message: r.title ? te(r.title) : void 0,
        description: te(r.message),
        showIcon: !0,
        style: { margin: "4px 0" }
      });
    case "Callout":
      return e.createElement(t.Alert || "div", {
        type: te(r.variant) === "tip" ? "success" : te(r.variant) === "warning" ? "warning" : te(r.variant) === "important" ? "error" : "info",
        message: r.title ? te(r.title) : void 0,
        description: te(r.message),
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
              background: te(r.status) === "done" ? ze.success : te(r.status) === "pending" ? ze.warning : ze.primary,
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
              te(r.title)
            ),
            r.date ? e.createElement(
              "div",
              { style: { fontSize: 12, color: ze.muted } },
              te(r.date)
            ) : null,
            r.description ? e.createElement(
              "div",
              { style: { fontSize: 13, marginTop: 4 } },
              te(r.description)
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
          te(r.title)
        ) : null,
        e.createElement(
          "div",
          { style: et("KpiBoard", r) },
          a()
        )
      );
    case "FeatureGrid":
      return e.createElement(
        "div",
        { style: { ...et("FeatureGrid", r), margin: "4px 0" } },
        a()
      );
    case "Stepper": {
      const o = Xt(r.steps).map((c) => te(c)), d = pt(r.current);
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
    case "Table": {
      const o = Xt(r.headers).map((u) => te(u)), c = i.filter((u) => u.kind === "TableRow").map((u, p) => {
        const E = (u.children || []).filter(
          (y) => y.kind === "TableCell"
        ), h = { key: p };
        return o.forEach((y, g) => {
          var x, v;
          const f = (v = (x = E[g]) == null ? void 0 : x.props) == null ? void 0 : v.value;
          h[y] = f == null ? "" : te(f);
        }), h;
      }), m = o.map((u) => ({ title: u, dataIndex: u, key: u }));
      return e.createElement(t.Table || "table", {
        dataSource: c,
        columns: m,
        size: gt(r.compact) ? "small" : "middle",
        pagination: !1,
        style: { margin: "4px 0" }
      });
    }
    case "List": {
      const o = i.filter((d) => d.kind === "ListItem");
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
                te(d.props.icon)
              ) : null,
              te((p = d.props) == null ? void 0 : p.value)
            );
          }
        )
      );
    }
    case "ImageGallery": {
      const o = i.filter((d) => d.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...et("ImageGallery", r), margin: "4px 0" } },
        ...o.map((d, c) => {
          const m = d.props || {};
          return e.createElement(gr, {
            key: c,
            src: te(m.src),
            alt: te(m.alt),
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
    case "Image":
      return e.createElement(
        "div",
        null,
        e.createElement(gr, {
          src: te(r.src),
          alt: te(r.alt),
          style: {
            maxWidth: "100%",
            borderRadius: gt(r.rounded) ? "8px" : void 0,
            maxHeight: r.maxHeight ? `${pt(r.maxHeight)}px` : void 0
          }
        }),
        r.caption ? e.createElement(
          "div",
          { style: { fontSize: 12, color: ze.muted } },
          te(r.caption)
        ) : null
      );
    case "Chart":
      return e.createElement(cd, { props: r });
    case "Button":
    case "InteractiveButton":
      return e.createElement(er, { node: n });
    case "ToggleButton":
      return e.createElement(er, { node: n, toggle: !0 });
    case "LinkButton":
      return e.createElement(er, { node: n, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(ad, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(rd, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", {
        color: te(r.color) || "default",
        closable: !0,
        onClose: () => {
        },
        children: te(r.label)
      });
    case "ChipGroup": {
      const o = Xt(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
        ...o.map(
          (d, c) => e.createElement(t.Tag || "span", { key: c }, te(d))
        )
      );
    }
    case "Tabs": {
      const o = un(e), c = i.filter((m) => m.kind === "TabItem").map((m) => {
        var u, p, E;
        return {
          key: te((u = m.props) == null ? void 0 : u.key) || te((p = m.props) == null ? void 0 : p.tab),
          label: te((E = m.props) == null ? void 0 : E.tab),
          children: (m.children || []).map(
            (h, y) => e.createElement(o, { key: h.nodeId || y, node: h })
          )
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, {
        items: c,
        defaultActiveKey: te(r.activeKey) || ((l = c[0]) == null ? void 0 : l.key)
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
      return e.createElement("div", null, a());
    case "Accordion": {
      const o = un(e), d = i.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = d.map((m) => {
          var u, p, E;
          return {
            key: te((u = m.props) == null ? void 0 : u.key) || te((p = m.props) == null ? void 0 : p.header),
            label: te((E = m.props) == null ? void 0 : E.header),
            children: (m.children || []).map(
              (h, y) => e.createElement(o, { key: h.nodeId || y, node: h })
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
                te((u = c.props) == null ? void 0 : u.header)
              ),
              e.createElement(
                "div",
                { style: { paddingLeft: 12 } },
                (c.children || []).map(
                  (p, E) => e.createElement(o, { key: p.nodeId || E, node: p })
                )
              )
            );
          }
        )
      );
    }
    case "AccordionItem":
      return e.createElement("div", null, a());
    case "JsonDebug":
      return e.createElement(
        "details",
        { style: { margin: "4px 0", fontSize: 12 } },
        e.createElement("summary", null, te(r.label) || "Debug JSON"),
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
function cd({
  props: e
}) {
  var M, z;
  const t = (z = (M = window.QwenPaw) == null ? void 0 : M.host) == null ? void 0 : z.React;
  if (!t) return null;
  const n = t.useContext(Un(t)), r = zr(e, n == null ? void 0 : n.values), i = r.chartType, a = r.title, s = r.categories, l = r.series, o = r.height, d = r.showLegend, c = 400;
  if (r.empty)
    return t.createElement(
      "div",
      { style: { padding: 12, color: ze.muted, fontSize: 12 } },
      "Chart: no data"
    );
  if (i === "pie") {
    const A = l[0].values.map((R) => Math.abs(R)), T = A.reduce((R, S) => R + S, 0) || 1, F = c / 2, G = o / 2, _ = Math.min(c, o) / 2 - 20;
    let $ = -Math.PI / 2;
    const I = A.map((R, S) => {
      const j = R / T * 2 * Math.PI, q = F + _ * Math.cos($), L = G + _ * Math.sin($), N = F + _ * Math.cos($ + j), J = G + _ * Math.sin($ + j), B = j > Math.PI ? 1 : 0, O = `M ${F} ${G} L ${q} ${L} A ${_} ${_} 0 ${B} 1 ${N} ${J} Z`;
      return $ += j, {
        path: O,
        color: Tt[S % Tt.length],
        label: s[S] || `#${S + 1}`,
        val: R
      };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a ? t.createElement(
        "div",
        { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } },
        a
      ) : null,
      t.createElement(
        "svg",
        { width: c, height: o, style: { maxWidth: "100%" } },
        ...I.map(
          (R, S) => t.createElement("path", {
            key: S,
            d: R.path,
            fill: R.color,
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
        ...I.map(
          (R, S) => t.createElement(
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
                background: R.color
              }
            }),
            `${R.label}: ${R.val}`
          )
        )
      ) : null
    );
  }
  const m = l.flatMap((A) => A.values), u = Math.max(...m, 0), p = Math.min(...m, 0), E = u - p || 1, h = s.length > 0 ? (c - 40) / s.length : 0, y = l.length > 0 ? Math.max(1, h / l.length - 2) : 0, g = s.length > 1 ? (c - 40) / (s.length - 1) : 0, f = Math.max(1, Math.ceil(s.length / 8)), x = (A) => o - 20 - (A - p) / E * (o - 40), v = x(0), k = (A) => 30 + A * g;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    a ? t.createElement(
      "div",
      { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } },
      a
    ) : null,
    t.createElement(
      "svg",
      { width: c, height: o, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((A, T) => {
        const F = o - 20 - A * (o - 40);
        return t.createElement("line", {
          key: `g${T}`,
          x1: 30,
          y1: F,
          x2: c - 10,
          y2: F,
          stroke: "var(--ant-color-border-secondary, #f0f0f0)",
          strokeWidth: 1
        });
      }),
      ...s.map(
        (A, T) => T % f === 0 || T === s.length - 1 ? t.createElement(
          "text",
          {
            key: `x${T}`,
            x: k(T),
            y: o - 6,
            fontSize: 10,
            fill: ze.muted,
            textAnchor: "middle"
          },
          A.length > 6 ? A.slice(0, 6) + "…" : A
        ) : null
      ),
      ...l.map((A, T) => {
        const F = Tt[T % Tt.length];
        if (i === "bar")
          return A.values.map(
            ($, I) => t.createElement("rect", {
              key: `b${T}-${I}`,
              x: 30 + I * h + T * (y + 2) + 1,
              y: Math.min(x($), v),
              width: y,
              height: Math.abs(v - x($)),
              fill: F,
              rx: 2
            })
          );
        const G = A.values.map(($, I) => `${k(I)},${x($)}`).join(" "), _ = [
          t.createElement("polyline", {
            key: `l${T}`,
            points: G,
            fill: "none",
            stroke: F,
            strokeWidth: 2
          })
        ];
        if (i === "area") {
          const $ = `${k(0)},${o - 20} ${G} ${k(
            A.values.length - 1
          )},${o - 20}`;
          _.unshift(
            t.createElement("polygon", {
              key: `a${T}`,
              points: $,
              fill: F,
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
        (A, T) => t.createElement(
          "span",
          {
            key: T,
            style: { display: "flex", alignItems: "center", gap: 4 }
          },
          t.createElement("span", {
            style: {
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: Tt[T % Tt.length]
            }
          }),
          A.name
        )
      )
    ) : null
  );
}
function gr(e) {
  var d;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: i } = n, [a, s] = r(
    Da(e.src) || (zn(e.src) ? e.src : null)
  ), [l, o] = r(
    Fa(e.src)
  );
  return i(() => {
    if (!e.src) return;
    if (zn(e.src)) {
      s(e.src), o(null);
      return;
    }
    const c = Da(e.src);
    if (c) {
      s(c), o(null);
      return;
    }
    s(null), o(null);
    let m = !1;
    return Fc(e.src).then((u) => {
      m || (s(u), o(u ? null : Fa(e.src)));
    }), () => {
      m = !0;
    };
  }, [e.src]), a ? n.createElement("img", {
    src: a,
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
function dd(e) {
  var i, a, s;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  return n ? e.src ? n.createElement(gr, {
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
    ((s = (a = e.name) == null ? void 0 : a.charAt(0)) == null ? void 0 : s.toUpperCase()) || ""
  ) : null;
}
const ud = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
@media print { body { padding: 0; } }`, Ha = {
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
function md(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function pd(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function ne(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = Ce(n)), r;
}
function kn(e, t) {
  Object.assign(e.style, t);
}
function Ht(e, t, n) {
  for (const r of t || [])
    e.appendChild(Pr(r, n));
  return e;
}
function Ja(e, t, n) {
  return t && e.appendChild(ne("div", "muted small", t)), e.appendChild(ne("div", "display-value", n)), e;
}
function is(e, t, n, r) {
  const i = Ce(e);
  if (r.missing.has(i)) {
    const s = ne(
      "div",
      `media-unavailable ${n}`.trim(),
      "此媒体未能离线嵌入"
    );
    return s.setAttribute("role", "img"), s.setAttribute("aria-label", Ce(t)), s;
  }
  const a = ne("img", n);
  return a.src = r.media[i] || i, a.alt = Ce(t), a;
}
function gd(e, t, n) {
  return e ? is(e, t, "avatar", n) : ne(
    "span",
    "avatar avatar-fallback",
    Ce(t).charAt(0).toUpperCase()
  );
}
function fd(e) {
  const t = ne("div", "markdown");
  let n = null;
  for (const r of Ce(e).split(/\r?\n/)) {
    const i = r.match(/^(#{1,4})\s+(.*)$/), a = r.match(/^\s*[-*]\s+(.*)$/);
    i ? (n = null, t.appendChild(ne(`h${i[1].length}`, "", i[2]))) : a ? (n || (n = ne("ul"), t.appendChild(n)), n.appendChild(ne("li", "", a[1]))) : r.trim() ? (n = null, t.appendChild(ne("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function yd(e, t) {
  const n = e.props || {}, r = e.kind, i = dn(e), a = ne("label", "field");
  n.label && r !== "Switch" && a.appendChild(
    ne(
      "span",
      "field-label",
      `${Ce(n.label)}${n.required ? " *" : ""}`
    )
  );
  let s;
  if (r === "Textarea") {
    const o = ne("textarea");
    o.rows = tt(n.rows) || 3, o.placeholder = Ce(n.placeholder), s = o;
  } else if (r === "Select") {
    const o = ne("select");
    for (const d of Kt(n.options)) {
      const c = ne("option"), m = d && typeof d == "object" ? d : null;
      c.value = Ce(m ? m.value : d), c.textContent = Ce(m ? m.label : d), o.appendChild(c);
    }
    s = o;
  } else {
    const o = ne("input");
    o.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (o.min = Ce(n.min)), n.max != null && (o.max = Ce(n.max)), n.step != null && (o.step = Ce(n.step)), r === "FileInput" ? (n.accept && (o.accept = Ce(n.accept)), o.multiple = nn(n.multiple)) : o.placeholder = Ce(n.placeholder), s = o;
  }
  const l = Object.prototype.hasOwnProperty.call(t.values, i) ? t.values[i] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const o = s;
    o.checked = nn(l), o.checked ? o.setAttribute("checked", "") : o.removeAttribute("checked");
  } else if (r === "Textarea")
    s.value = Ce(l), s.textContent = Ce(l);
  else if (r === "Select") {
    const o = Ce(l);
    s.value = o;
    for (const d of Array.from(s.options))
      d.value === o ? d.setAttribute("selected", "") : d.removeAttribute("selected");
  } else r !== "FileInput" && (s.value = Ce(l), s.setAttribute("value", Ce(l)));
  if (s.setAttribute("data-genui-field", i), s.setAttribute("data-genui-kind", r), r === "Switch") {
    const o = ne("span", "switch-line");
    o.append(s, ne("span", "", n.label)), a.appendChild(o);
  } else if (r === "Slider") {
    const o = ne("span", "slider-line");
    o.append(s, ne("output", "slider-value", l)), a.appendChild(o);
  } else
    a.appendChild(s);
  return n.description && a.appendChild(ne("small", "description", n.description)), a;
}
function Pr(e, t) {
  var a, s, l, o, d, c, m;
  if (!e || typeof e != "object") return ne("div");
  const n = e.props || {}, r = e.children || [];
  if (es(e.kind)) return yd(e, t);
  if (e.kind === "Chart") {
    const u = ne("div", "chart");
    return u.setAttribute("data-genui-chart", JSON.stringify(n)), ns(u, zr(n, t.values)), u;
  }
  if (e.kind === "Heading")
    return ne(`h${ts(n.level)}`, "", n.value);
  if (e.kind === "Text")
    return ne("div", nn(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown")
    return fd(n.content || n.value);
  if (e.kind === "CodeBlock") return ne("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const u = ne("div", "section-header");
    n.icon && u.appendChild(ne("span", "section-icon", n.icon));
    const p = ne("div");
    return p.appendChild(ne("strong", "", n.title)), n.subtitle && p.appendChild(ne("div", "muted small", n.subtitle)), u.appendChild(p), u;
  }
  if (e.kind === "KeyValueList") {
    const u = ne("dl", "key-values");
    for (const p of Kt(n.items)) {
      const E = p && typeof p == "object" ? p : {};
      u.append(ne("dt", "", E.key), ne("dd", "", E.value));
    }
    return u;
  }
  if (e.kind === "Divider") {
    const u = ne("div", "divider");
    return n.label && u.appendChild(ne("span", "", n.label)), u;
  }
  if (e.kind === "Spacer") {
    const u = ne("div");
    return kn(u, et("Spacer", n)), u;
  }
  if (e.kind === "Tabs") {
    const u = ne("div", "tabs");
    u.setAttribute("data-genui-tabs", "1");
    const p = ne("div", "tab-buttons"), E = ne("div");
    return r.filter((y) => y.kind === "TabItem").forEach((y, g) => {
      var f;
      p.appendChild(ne("button", g ? "" : "active", (f = y.props) == null ? void 0 : f.tab)), E.appendChild(
        Ht(
          ne("div", g ? "tab-panel hidden" : "tab-panel"),
          y.children,
          t
        )
      );
    }), u.append(p, E), u;
  }
  if (e.kind === "Accordion") {
    const u = ne("div");
    for (const p of r.filter(
      (E) => E.kind === "AccordionItem"
    )) {
      const E = ne("details");
      E.append(
        ne("summary", "", (a = p.props) == null ? void 0 : a.header),
        Ht(ne("div", "accordion-body"), p.children, t)
      ), u.appendChild(E);
    }
    return u;
  }
  if (e.kind === "Form") {
    const u = ne("div", "stack form");
    n.title && u.appendChild(ne("div", "card-title", n.title)), Ht(u, r, t);
    const p = ne("button", "button", Ce(n.submitLabel) || "提交");
    return p.setAttribute("data-genui-submit", "1"), u.appendChild(p), u;
  }
  if (Hc.has(e.kind)) {
    const u = ne(
      "button",
      e.kind === "LinkButton" ? "link-button" : "button",
      Ce(n.label) || "Action"
    );
    return nn(n.disabled) && (u.disabled = !0), u.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && Kc(n.href) && u.setAttribute("data-genui-href", Ce(n.href).trim()), u;
  }
  if (e.kind === "Image") {
    const u = ne("figure");
    return u.appendChild(is(n.src, n.alt, "", t)), n.caption && u.appendChild(ne("figcaption", "", n.caption)), u;
  }
  if (e.kind === "ImageGallery") {
    const u = ne("div", "image-gallery");
    kn(u, et("ImageGallery", n));
    for (const p of r.filter((E) => E.kind === "Image"))
      u.appendChild(Pr(p, t));
    return u;
  }
  if (e.kind === "Avatar") return gd(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return ne("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const u = ne("progress");
    return u.max = 100, u.value = tt(n.value), u;
  }
  if (e.kind === "Stat") {
    const u = ne("div", "stat");
    return u.append(
      ne("span", "muted small", n.label),
      ne("strong", "stat-value", n.value)
    ), n.delta && u.appendChild(
      ne("span", `small trend-${Ce(n.trend)}`, n.delta)
    ), u;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const u = ne("div", "card metric-card"), p = Ja(ne("div"), n.title, n.value);
    return n.delta && p.appendChild(
      ne(
        "div",
        `small trend-${Ce(n.trend)}`,
        `${Ce(n.delta)}${n.period ? ` ${Ce(n.period)}` : ""}`
      )
    ), u.appendChild(p), n.icon && u.appendChild(ne("span", "metric-icon", n.icon)), u;
  }
  if (e.kind === "TimelineCard") {
    const u = ne("div", "card timeline");
    return u.append(
      ne("i", `timeline-dot status-${Ce(n.status)}`),
      Ja(ne("div"), n.title, n.date)
    ), n.description && u.appendChild(ne("div", "small", n.description)), u;
  }
  if (e.kind === "Stepper") {
    const u = ne("ol", "stepper");
    return Kt(n.steps).forEach((p, E) => {
      u.appendChild(
        ne("li", E <= tt(n.current) ? "active" : "", p)
      );
    }), u;
  }
  if (e.kind === "Table") {
    const u = ne("table", "data-table"), p = ne("thead"), E = ne("tr");
    for (const y of Kt(n.headers))
      E.appendChild(ne("th", "", y));
    p.appendChild(E);
    const h = ne("tbody");
    for (const y of r.filter((g) => g.kind === "TableRow")) {
      const g = ne("tr", (s = y.props) != null && s.highlight ? "highlight" : "");
      for (const f of (y.children || []).filter(
        (x) => x.kind === "TableCell"
      )) {
        const x = ne("td", (l = f.props) != null && l.bold ? "bold" : "", (o = f.props) == null ? void 0 : o.value);
        (d = f.props) != null && d.align && (x.style.textAlign = Ce(f.props.align)), g.appendChild(x);
      }
      h.appendChild(g);
    }
    return u.append(p, h), u;
  }
  if (e.kind === "List") {
    const u = ne(nn(n.ordered) ? "ol" : "ul", "data-list");
    for (const p of r.filter((E) => E.kind === "ListItem"))
      u.appendChild(
        ne(
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
    const u = ne("div", "chips");
    for (const p of Kt(n.items))
      u.appendChild(ne("span", "tag", p));
    return u;
  }
  if (e.kind === "Skeleton") {
    const u = ne("div", "skeletons");
    for (let p = 0; p < (tt(n.rows) || 3); p += 1)
      u.appendChild(ne("i", "skeleton"));
    return u;
  }
  if (e.kind === "Icon") {
    const u = ne("span", "icon");
    return Qc(u, n.name, { size: tt(n.size) || 16 }), u;
  }
  if (e.kind === "JsonDebug") {
    const u = ne("details");
    return u.append(
      ne("summary", "", Ce(n.label) || "Debug JSON"),
      ne(
        "pre",
        "code",
        JSON.stringify(n.data == null ? n : n.data, null, 2)
      )
    ), u;
  }
  if (e.kind === "KpiBoard") {
    const u = ne("div", "stack");
    n.title && u.appendChild(ne("div", "card-title", n.title));
    const p = ne("div", "grid");
    return kn(p, et("KpiBoard", n)), Ht(p, r, t), u.appendChild(p), u;
  }
  if (!Object.prototype.hasOwnProperty.call(Ha, e.kind))
    return ne(
      "div",
      "unknown-component",
      `Unknown component: ${Ce(e.kind)}`
    );
  const i = ne("div", Ha[e.kind]);
  return kn(i, et(e.kind, n)), e.kind === "Card" && n.title && i.appendChild(ne("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && i.appendChild(ne("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && i.appendChild(ne("strong", "", n.title)), n.message && i.appendChild(ne("div", "", n.message))) : Ht(i, r, t), i;
}
function Va(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function hd() {
  return `(function () {
  "use strict";
  ${Va(zr, "resolveChartModel")}
  ${Va(ns, "paintChartElement")}
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
function Ed(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = ne("main");
  return r.id = "genui-root", r.appendChild(
    Pr(e, {
      values: t,
      media: n.sources || {},
      missing: new Set(n.missing || [])
    })
  ), r;
}
function ss(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const i = Ed(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${md(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${ud}
  </style>
</head>
<body>${i.outerHTML}
<script id="genui-values-data" type="application/json">${pd(
    t
  )}<\/script>
<script>${hd()}<\/script></body>
</html>`;
}
function os(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function bd(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => dm), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  os(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", {
    filename: t,
    via: "html-to-image"
  });
}
function vd(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function wd(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await vd(await n.blob()) : null;
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
async function ls(e) {
  const t = {}, n = [], r = Array.from(
    e.querySelectorAll("img[data-genui-media-source]")
  );
  return await Promise.all(
    r.map(async (i) => {
      const a = i.dataset.genuiMediaSource || "", s = await wd(i);
      a && (s ? t[a] = s : n.push(a));
    })
  ), { sources: t, missing: Array.from(new Set(n)) };
}
async function xd(e, t, n, r, i = r) {
  const a = await ls(e), s = ss(
    t,
    n,
    a,
    i
  ), l = new Blob([s], { type: "text/html;charset=utf-8" }), o = URL.createObjectURL(l);
  os(o, `${r}.html`), setTimeout(() => URL.revokeObjectURL(o), 1e3), a.missing.length && console.warn(
    "[ugsci.genui] HTML export has media that could not be embedded",
    { filename: r, missing: a.missing }
  ), console.info("[ugsci.genui] HTML export created", {
    filename: r,
    bytes: l.size,
    embeddedMedia: Object.keys(a.sources).length,
    missingMedia: a.missing.length
  });
}
async function Sd(e, t, n, r) {
  const i = await ls(e), a = ss(
    t,
    n,
    i,
    r
  ), s = window.open("", "_blank", "noopener,noreferrer");
  if (!s) throw new Error("print window was blocked");
  s.document.open(), s.document.write(a), s.document.close(), await new Promise((l) => {
    const o = () => l();
    if (s.document.readyState === "complete") {
      window.setTimeout(o, 50);
      return;
    }
    s.addEventListener("load", o, { once: !0 }), window.setTimeout(o, 400);
  }), s.focus(), s.print(), s.close(), i.missing.length && console.warn(
    "[ugsci.genui] PDF print has media that could not be embedded",
    { missing: i.missing }
  );
}
const Ve = "var(--ant-color-text, rgba(0, 0, 0, 0.88))", We = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))", zt = "var(--ant-color-border-secondary, #f0f0f0)", fr = "var(--ant-color-bg-container, #fff)", yr = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))", cs = "var(--ant-color-success, #52c41a)", kd = "var(--ant-color-success-bg, #f6ffed)", _d = "var(--ant-color-warning, #faad14)", Cd = "var(--ant-color-warning-bg, #fffbe6)", ds = "var(--ant-color-error, #ff4d4f)", Td = "var(--ant-color-error-bg, #fff2f0)", Ka = "var(--ant-color-primary, #1677ff)", Id = {
  derived_expression: "推导结果",
  effective_inventory: "有效库存",
  estimated_ogip: "估算原始储量",
  initial_p_over_z: "初始 p/z",
  current_p_over_z: "当前 p/z",
  recovery_factor: "采收率",
  remaining_gas: "剩余气量",
  result: "计算结果",
  transformed_expression: "变换结果"
}, us = {
  current_pressure: "当前压力",
  current_z_factor: "当前 z 因子",
  initial_pressure: "初始压力",
  initial_z_factor: "初始 z 因子",
  produced_gas: "累计产气量"
};
function mn(e) {
  return Id[e] || us[e] || e.replace(/[_.-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function $d(e, t = "") {
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
function Rn(e, t = "") {
  if (typeof e == "number") return $d(e, t);
  if (typeof e == "boolean") return e ? "是" : "否";
  if (e == null) return "—";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function Xa(e) {
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
function Ad(e) {
  const t = e == null ? void 0 : e.result;
  return !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(
    ([, n]) => ["string", "number", "boolean"].includes(typeof n)
  ).sort(([n], [r]) => Xa(n) - Xa(r)).slice(0, 4).map(([n, r]) => {
    var i;
    return {
      key: n,
      label: mn(n),
      value: Rn(r, n),
      unit: String(((i = e == null ? void 0 : e.units) == null ? void 0 : i[n]) || "")
    };
  });
}
function zd(e) {
  var r, i;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.steps) ? e.trace.steps : [], n = t.find(
    (a) => (a == null ? void 0 : a.operation) === "solve" && ((a == null ? void 0 : a.unicode) || (a == null ? void 0 : a.expression))
  ) || t.find(
    (a) => (a == null ? void 0 : a.group) === "assemble" && ((a == null ? void 0 : a.unicode) || (a == null ? void 0 : a.expression))
  ) || t.find((a) => (a == null ? void 0 : a.unicode) || (a == null ? void 0 : a.expression));
  return String(
    (n == null ? void 0 : n.unicode) || (n == null ? void 0 : n.expression) || ((i = e == null ? void 0 : e.trace) == null ? void 0 : i.symbols) || (e == null ? void 0 : e.method) || "—"
  );
}
function Rd(e) {
  var r, i;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.variables) ? e.trace.variables.filter((a) => (a == null ? void 0 : a.source) === "input") : [];
  if (t.length)
    return t.slice(0, 8).map((a) => ({
      name: String(a.name || ""),
      label: String(
        us[String(a.name || "")] || a.display_name || mn(String(a.name || "参数"))
      ),
      value: `${Rn(a.value, a.name)}${a.unit ? ` ${a.unit}` : ""}`,
      source: "用户输入"
    }));
  const n = ((i = e == null ? void 0 : e.provenance) == null ? void 0 : i.parameter_sources) || {};
  return Object.entries(n).filter(([, a]) => (a == null ? void 0 : a.source) === "user_input").slice(0, 8).map(([a, s]) => ({
    name: a,
    label: mn(a),
    value: `${Rn(s == null ? void 0 : s.value, a)}${s != null && s.unit ? ` ${s.unit}` : ""}`,
    source: "用户输入"
  }));
}
function Dn(e) {
  var c, m, u, p;
  const t = (e == null ? void 0 : e.provenance) || {}, n = t.unit_audit, r = Object.values((n == null ? void 0 : n.per_symbol) || {}), i = typeof (n == null ? void 0 : n.ok) == "boolean" ? n.ok : null, a = t.source || ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.source), s = Array.isArray(e == null ? void 0 : e.warnings) ? e.warnings.map(String) : [];
  let l = "success", o = "公式与单位已核验", d = "公式匹配、参数完整，计算证据链可追溯。";
  return i === !1 ? (l = "error", o = "单位检查未通过", d = "结果使用前需要修正单位不一致项。") : a === "freeform" ? (l = "warning", o = "AI 推导 · 建议复核", d = "符号步骤已通过安全校验，但公式并非审定公式库来源。") : s.length ? (l = "warning", o = "计算完成 · 存在提醒", d = "核心计算已完成，请同时阅读警告和适用条件。") : i === null && (o = "计算证据链已记录", d = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。"), {
    title: ((m = e == null ? void 0 : e.trace) == null ? void 0 : m.formula_name) || ((u = e == null ? void 0 : e.trace) == null ? void 0 : u.title) || (e == null ? void 0 : e.operation) || "UGSci 数学计算",
    formula: zd(e),
    trustLabel: o,
    trustDetail: d,
    trustTone: l,
    results: Ad(e),
    inputs: Rd(e),
    boundaries: [
      ...Array.isArray(e == null ? void 0 : e.applicability) ? e.applicability : [],
      ...Array.isArray(e == null ? void 0 : e.assumptions) ? e.assumptions : []
    ].map(String),
    warnings: s,
    stepCount: Array.isArray((p = e == null ? void 0 : e.trace) == null ? void 0 : p.steps) ? e.trace.steps.length : 0,
    passedGateCount: Array.isArray(t.gate) ? t.gate.length : 0,
    unitCheckCount: r.length,
    unitAuditOk: i
  };
}
function Pd(e) {
  return e === "error" ? { color: ds, background: Td } : e === "warning" ? { color: _d, background: Cd } : { color: cs, background: kd };
}
function vt({ children: e }) {
  return P().React.createElement(
    "div",
    { style: { fontWeight: 600, color: Ve, marginBottom: 8 } },
    e
  );
}
function Or({
  payload: e,
  onOpenDerivation: t,
  onOpenEvidence: n,
  onReplay: r,
  compact: i = !1
}) {
  const a = P().React, s = Dn(e), l = Pd(s.trustTone), o = s.results[0], d = s.results.slice(1, i ? 2 : 4);
  return a.createElement(
    "div",
    { style: { display: "grid", gap: i ? 9 : 14 } },
    a.createElement(
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
      a.createElement(
        "div",
        null,
        a.createElement(
          "div",
          { style: { color: We, fontSize: 12, marginBottom: 3 } },
          i ? "计算摘要" : s.title
        ),
        o ? a.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              flexWrap: "wrap"
            }
          },
          a.createElement(
            "strong",
            {
              style: {
                color: Ve,
                fontSize: i ? 22 : 28,
                fontWeight: 600,
                overflowWrap: "anywhere"
              }
            },
            o.value
          ),
          o.unit ? a.createElement(
            "span",
            { style: { color: We, fontSize: 13 } },
            o.unit
          ) : null
        ) : a.createElement(
          "strong",
          { style: { color: Ve } },
          "计算已完成"
        ),
        o ? a.createElement(
          "div",
          { style: { color: We, fontSize: 12, marginTop: 3 } },
          o.label
        ) : null
      ),
      a.createElement(
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
    a.createElement(
      "p",
      {
        style: {
          margin: 0,
          color: i ? We : Ve,
          fontSize: 13,
          lineHeight: 1.65
        }
      },
      s.trustDetail
    ),
    d.length ? a.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 6,
          paddingTop: 10,
          borderTop: `1px solid ${zt}`
        }
      },
      ...d.map(
        (c) => a.createElement(
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
          a.createElement(
            "span",
            { style: { color: We } },
            c.label
          ),
          a.createElement(
            "span",
            { style: { color: Ve, textAlign: "right" } },
            `${c.value}${c.unit ? ` ${c.unit}` : ""}`
          )
        )
      )
    ) : null,
    i ? null : a.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 7,
          paddingTop: 10,
          borderTop: `1px solid ${zt}`,
          fontSize: 12
        }
      },
      a.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        a.createElement(
          "span",
          { style: { color: We } },
          "使用公式"
        ),
        a.createElement(
          "code",
          { style: { color: Ve, overflowWrap: "anywhere" } },
          s.formula
        )
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        a.createElement(
          "span",
          { style: { color: We } },
          "关键输入"
        ),
        a.createElement(
          "span",
          { style: { color: Ve } },
          s.inputs.length ? s.inputs.slice(0, 5).map((c) => `${c.label}=${c.value}`).join("；") : "未提供可展示的输入摘要"
        )
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        a.createElement(
          "span",
          { style: { color: We } },
          "适用条件"
        ),
        a.createElement(
          "span",
          { style: { color: Ve } },
          s.boundaries.slice(0, 2).join("；") || "未声明额外适用条件"
        )
      )
    ),
    a.createElement(
      "div",
      { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
      t ? a.createElement(
        "button",
        {
          type: "button",
          onClick: t,
          style: {
            border: `1px solid ${Ka}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Ka,
            color: "var(--ant-color-text-light-solid, #fff)",
            cursor: "pointer"
          }
        },
        "查看推导"
      ) : null,
      n ? a.createElement(
        "button",
        {
          type: "button",
          onClick: n,
          style: {
            border: `1px solid ${zt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: fr,
            color: Ve,
            cursor: "pointer"
          }
        },
        "证据与来源"
      ) : null,
      r ? a.createElement(
        "button",
        {
          type: "button",
          onClick: r,
          style: {
            border: `1px solid ${zt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: fr,
            color: Ve,
            cursor: "pointer"
          }
        },
        "复现计算"
      ) : null
    )
  );
}
function Od({ payload: e }) {
  const t = P().React, n = Dn(e);
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(vt, null, "你最需要知道的"),
      t.createElement(
        "p",
        { style: { margin: 0, color: Ve, fontSize: 13, lineHeight: 1.7 } },
        `本次使用 ${n.title}，读取 ${n.inputs.length} 项输入，记录 ${n.stepCount} 个推导步骤`,
        n.passedGateCount ? `，并通过 ${n.passedGateCount} 项计算校验。` : "。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(vt, null, "边界与提醒"),
      n.boundaries.length || n.warnings.length ? t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: We,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...[...n.warnings, ...n.boundaries].slice(0, 4).map(
          (r, i) => t.createElement("li", { key: `${i}:${r}` }, r)
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: We, fontSize: 12 } },
        "未声明额外边界条件。"
      )
    )
  );
}
function Md({ payload: e }) {
  var l, o, d;
  const t = P().React, n = Dn(e), r = (e == null ? void 0 : e.provenance) || {}, i = Object.entries(((l = r == null ? void 0 : r.unit_audit) == null ? void 0 : l.per_symbol) || {}), a = Object.entries((r == null ? void 0 : r.parameter_sources) || {}), s = (c, m, u = c) => t.createElement(
    "div",
    {
      key: u,
      style: {
        display: "grid",
        gridTemplateColumns: "90px minmax(0, 1fr)",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${zt}`,
        fontSize: 12
      }
    },
    t.createElement("span", { style: { color: We } }, c),
    t.createElement(
      "span",
      { style: { color: Ve, overflowWrap: "anywhere" } },
      m || "—"
    )
  );
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(vt, null, "公式身份"),
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
        vt,
        null,
        `参数来源（${a.length}）`
      ),
      a.length ? t.createElement(
        "div",
        { style: { display: "grid" } },
        ...a.map(
          ([c, m]) => s(
            mn(c),
            `${(m == null ? void 0 : m.source) === "user_input" ? "用户输入" : "推导生成"} · ${Rn(m == null ? void 0 : m.value, c)}${m != null && m.unit ? ` ${m.unit}` : ""}`,
            c
          )
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: We, fontSize: 12 } },
        "没有参数来源记录。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        vt,
        null,
        `单位审计（${n.unitCheckCount} 项）`
      ),
      t.createElement(
        "div",
        {
          style: {
            color: n.unitAuditOk === !1 ? ds : n.unitAuditOk === !0 ? cs : We,
            fontSize: 12,
            marginBottom: i.length ? 8 : 0
          }
        },
        n.unitAuditOk === !1 ? "存在不一致单位" : n.unitAuditOk === !0 ? "全部单位一致" : "此结果没有单位审计数据"
      ),
      i.length ? t.createElement(
        "details",
        null,
        t.createElement(
          "summary",
          { style: { cursor: "pointer", color: We, fontSize: 12 } },
          "查看逐项单位检查"
        ),
        t.createElement(
          "div",
          { style: { marginTop: 6 } },
          ...i.map(
            ([c, m]) => s(
              mn(c),
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
      t.createElement(vt, null, "通过的计算校验"),
      t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: We,
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
      t.createElement(vt, null, "复现身份"),
      t.createElement(
        "code",
        {
          style: {
            display: "block",
            padding: 10,
            borderRadius: 8,
            background: yr,
            color: We,
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
function Ld({ payload: e }) {
  const t = P().React, n = Dn(e), [r, i] = t.useState(!1), a = e == null ? void 0 : e.replay, s = [
    [n.stepCount, "计算步骤"],
    [n.passedGateCount, "校验通过"],
    [(a == null ? void 0 : a.elapsedMs) != null ? `${a.elapsedMs} ms` : "—", "复现耗时"]
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
            style: { padding: 10, borderRadius: 8, background: yr }
          },
          t.createElement(
            "strong",
            { style: { display: "block", color: Ve } },
            String(l)
          ),
          t.createElement(
            "span",
            { style: { color: We, fontSize: 11 } },
            String(o)
          )
        )
      )
    ),
    t.createElement(
      "button",
      {
        type: "button",
        onClick: () => i(!r),
        "aria-expanded": r,
        style: {
          justifySelf: "start",
          border: `1px solid ${zt}`,
          borderRadius: 7,
          padding: "6px 10px",
          background: fr,
          color: Ve,
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
          background: yr,
          color: We,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          fontSize: 11,
          lineHeight: 1.55
        }
      },
      JSON.stringify(e, null, 2)
    ) : t.createElement(
      "p",
      { style: { margin: 0, color: We, fontSize: 12 } },
      "原始运行数据默认隐藏，需要诊断或审计时再展开。"
    )
  );
}
const Bd = 128;
let hr = [], ms = "";
const Er = /* @__PURE__ */ new Set(), ps = () => Er.forEach((e) => e()), gs = (e) => (Er.add(e), () => Er.delete(e)), Ya = () => hr;
function Mr(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function jd(e) {
  if (!e || typeof e != "object" || !e.replay_id || !e.status || !Mr(e.result))
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
function Lr(e, t) {
  var i, a, s, l, o;
  if (!Mr(e)) return null;
  const n = (i = e.replay) != null && i.replayId ? `replay:${e.replay.replayId}` : `${((a = e.trace) == null ? void 0 : a.formula_id) || "derivation"}:${((s = e.provenance) == null ? void 0 : s.input_fingerprint) || e.operation || crypto.randomUUID()}`, r = {
    uiId: n,
    sessionId: t || ((o = (l = P()).getCurrentSessionId) == null ? void 0 : o.call(l)) || "",
    payload: e,
    updatedAt: Date.now()
  };
  return hr = [r, ...hr.filter((d) => d.uiId !== n)].slice(
    0,
    Bd
  ), ps(), r;
}
function Br(e) {
  ms = e, ps();
}
function Nd() {
  return P().React.useSyncExternalStore(
    gs,
    () => ms,
    () => ""
  );
}
function fs(e) {
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
    const i = jd(r);
    if (i) {
      t.push(i);
      return;
    }
    Mr(r) && t.push(r), Object.values(r).forEach(n);
  };
  return n(e), Array.from(
    new Map(
      t.map((r) => {
        var i, a;
        return [
          String(((i = r.provenance) == null ? void 0 : i.replay_token) || ((a = r.trace) == null ? void 0 : a.formula_id)) + JSON.stringify(r.result || {}),
          r
        ];
      })
    ).values()
  );
}
function Ud(e, t) {
  fs(e).forEach(
    (n) => Lr(n, t)
  );
}
function Dd(e) {
  const t = P().React, n = t.useSyncExternalStore(gs, Ya, Ya);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
const Fd = [], Pt = /* @__PURE__ */ new Map();
function Gd(e) {
  Pt.set(e, (Pt.get(e) || 0) + 1);
}
function Wd(e) {
  const t = (Pt.get(e) || 1) - 1;
  t > 0 ? Pt.set(e, t) : Pt.delete(e);
}
function qd(e) {
  return (Pt.get(e) || 0) > 0;
}
function Qa(e) {
  const t = [], n = (r) => {
    t.push(r);
    for (const i of r.children || []) n(i);
  };
  return n(e), t;
}
function Hd(e) {
  var d, c;
  const t = Qa(e), n = String(
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
  ), i = t.filter((m) => m.kind === "MetricCard").map((m) => {
    var u, p;
    return {
      label: String(((u = m.props) == null ? void 0 : u.title) || "结果"),
      value: String(((p = m.props) == null ? void 0 : p.value) ?? "—")
    };
  }), a = t.filter((m) => m.kind === "TableRow").map(
    (m) => (m.children || []).filter((u) => u.kind === "TableCell").map((u) => {
      var p;
      return String(((p = u.props) == null ? void 0 : p.value) ?? "");
    })
  ).filter((m) => m.length >= 4 && m[3] === "derived").map((m) => ({
    label: m[0] || "结果",
    value: [m[1], m[2]].filter(Boolean).join(" ")
  })).reverse(), s = t.filter((m) => m.kind === "NumberInput" || m.kind === "Slider").slice(0, 5).map(
    (m) => {
      var u, p, E;
      return `${String(((u = m.props) == null ? void 0 : u.label) || ((p = m.props) == null ? void 0 : p.name) || "输入")}=${String(
        ((E = m.props) == null ? void 0 : E.value) ?? "—"
      )}`;
    }
  ), l = t.filter((m) => m.kind === "AccordionItem").filter(
    (m) => {
      var u;
      return ["适用场景", "假设条件"].includes(String(((u = m.props) == null ? void 0 : u.header) || ""));
    }
  ).flatMap((m) => Qa(m)).filter((m) => m.kind === "ListItem").map((m) => {
    var u;
    return String(((u = m.props) == null ? void 0 : u.value) || "");
  }).filter(Boolean).slice(0, 3), o = [...a, ...i].filter(
    (m, u, p) => p.findIndex(
      (E) => E.label === m.label && E.value === m.value
    ) === u
  );
  return { title: n, warning: r, inputs: s, conditions: l, results: o };
}
function Jd({
  data: e
}) {
  var h, y;
  const t = (h = window.QwenPaw) == null ? void 0 : h.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = Tc(), i = n.useRef(
    /* @__PURE__ */ new Map()
  ), a = ((y = t.getCurrentSessionId) == null ? void 0 : y.call(t)) || "__current_chat__", s = Array.isArray(e.output) ? e.output : Fd, l = n.useMemo(() => Ki(s), [s]), o = n.useMemo(() => fs(s), [s]);
  n.useEffect(() => {
    for (const g of l) {
      if (!g.ui_id || !g.tree) continue;
      const f = r.getSnapshot(a, g.ui_id);
      f && f.revision >= (g.revision || 1) || r.setSnapshot({
        schemaVersion: "1",
        uiId: g.ui_id,
        revision: g.revision || 1,
        tree: g.tree,
        sessionId: a,
        sourceToolCallId: g.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [l, a]);
  const d = n.useMemo(
    () => l.filter((g) => g.kind === "genui" && !!g.ui_id).map((g) => g.ui_id),
    [l]
  ), c = d.join("\0");
  n.useEffect(() => {
    for (const g of d) Gd(g);
    return () => {
      for (const g of d) Wd(g);
    };
  }, [c]);
  const m = n.useMemo(
    () => l.map((g) => g.ui_id).filter((g) => !!g),
    [l]
  ), p = Ic(a, m).filter(
    (g) => (
      // Only include snapshots whose ui_id appears in this response's results
      l.some(
        (f) => f.ui_id === g.uiId && (f.kind === "genui" || f.kind === "genui_patch" && !qd(g.uiId))
      )
    )
  ).sort((g, f) => g.updatedAt - f.updatedAt);
  if (o.length > 0)
    return n.createElement(
      "div",
      {
        className: "qwenpaw-genui-inline qwenpaw-derivation-inline",
        style: { marginTop: 8, marginBottom: 8, display: "grid", gap: 8 }
      },
      ...o.map(
        (g, f) => {
          var x, v;
          return n.createElement(
            "div",
            {
              key: String(
                ((x = g.provenance) == null ? void 0 : x.replay_token) || ((v = g.trace) == null ? void 0 : v.formula_id) || f
              ),
              style: {
                border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                borderRadius: 12,
                padding: 12,
                background: "var(--ant-color-bg-container, #fff)"
              }
            },
            n.createElement(Or, {
              payload: g,
              compact: !0,
              onOpenDerivation: () => {
                const k = Lr(g, a);
                k != null && k.uiId && Br(k.uiId), window.dispatchEvent(
                  new CustomEvent("qwenpaw:open-compute-workbench", {
                    detail: { uiId: k == null ? void 0 : k.uiId }
                  })
                );
              }
            })
          );
        }
      )
    );
  if (p.length === 0) return null;
  const E = (g) => n.createElement(
    "div",
    {
      key: Mt(g.sessionId, g.uiId),
      className: "qwenpaw-genui-tree",
      "data-genui-id": g.uiId,
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        background: "var(--ant-color-bg-container, #fff)"
      },
      ref: (f) => {
        f && (f.__genuiId = g.uiId);
      }
    },
    n.createElement(
      "div",
      { className: "qwenpaw-genui-export-target" },
      n.createElement(Zc, {
        node: g.tree.root,
        onValuesChange: (f) => i.current.set(g.uiId, f),
        children: n.createElement(od, {
          node: g.tree.root
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
          onClick: (f) => {
            var v;
            const x = (v = f.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : v.querySelector(
              ".qwenpaw-genui-export-target"
            );
            x && bd(x, g.uiId).catch(
              (k) => console.warn("[ugsci.genui] PNG export failed", k)
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
          onClick: (f) => {
            var v;
            const x = (v = f.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : v.querySelector(
              ".qwenpaw-genui-export-target"
            );
            x && Sd(
              x,
              g.tree.root,
              i.current.get(g.uiId) || {},
              g.uiId
            ).catch(
              (k) => console.warn("[ugsci.genui] PDF print failed", k)
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
          onClick: (f) => {
            var v;
            const x = (v = f.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : v.querySelector(
              ".qwenpaw-genui-export-target"
            );
            x && xd(
              x,
              g.tree.root,
              i.current.get(g.uiId) || {},
              g.uiId,
              g.uiId
            ).catch(
              (k) => console.warn("[ugsci.genui] HTML export failed", k)
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
    ...p.map((g) => {
      if (!g.uiId.startsWith("ui_trc_")) return E(g);
      const f = Hd(g.tree.root), x = f.results[0] || {
        label: "计算结果",
        value: "已完成"
      };
      return n.createElement(
        "div",
        {
          key: Mt(g.sessionId, g.uiId),
          className: "qwenpaw-derivation-inline",
          "data-trace-ui-id": g.uiId,
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
              f.title
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
              x.value
            ),
            n.createElement(
              "span",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12
                }
              },
              x.label
            )
          ),
          n.createElement(
            "span",
            {
              style: {
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 12,
                color: f.warning ? "var(--ant-color-warning, #faad14)" : "var(--ant-color-success, #52c41a)",
                background: f.warning ? "var(--ant-color-warning-bg, #fffbe6)" : "var(--ant-color-success-bg, #f6ffed)"
              }
            },
            f.warning ? "需要人工复核" : "✓ 公式与单位已核验"
          )
        ),
        f.results.length > 1 ? n.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8
            }
          },
          ...f.results.slice(1, 4).map(
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
        f.inputs.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `关键输入：${f.inputs.join("；")}`
        ) : null,
        f.conditions.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `适用条件：${f.conditions.join("；")}`
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
            E(g)
          )
        )
      );
    })
  );
}
function Vd({ payload: e }) {
  var l, o;
  const t = P().React, n = ((l = e == null ? void 0 : e.trace) == null ? void 0 : l.variables) || [], r = ((o = e == null ? void 0 : e.trace) == null ? void 0 : o.steps) || [], i = [
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
  ], a = new Map(i.map((d) => [d.id, d])), s = [];
  for (const d of r) {
    for (const c of d.reads || [])
      a.has(c) && s.push({ from: c, to: d.id });
    d.writes && a.has(d.writes) && s.push({ from: d.id, to: d.writes });
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
      const m = a.get(d.from), u = a.get(d.to);
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
    ...i.map(
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
function Kd({
  payload: e,
  compact: t = !1
}) {
  var d;
  const n = P().React, [r, i] = n.useState(!t), a = ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.steps) || [], s = a.filter(
    (c) => c.kind !== "bind" || c.note !== "input"
  ), o = (r ? a : s).map(
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
    t && a.length !== s.length ? n.createElement(
      "button",
      {
        type: "button",
        onClick: () => i((c) => !c),
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
      r ? "只看关键步骤" : `显示全部 ${a.length} 步`
    ) : null
  );
}
const _n = "var(--ant-color-text, rgba(0,0,0,.88))", tr = "var(--ant-color-text-secondary, rgba(0,0,0,.45))", Za = "var(--ant-color-border, #d9d9d9)", nr = "var(--ant-color-bg-container, #fff)", ei = "var(--ant-color-primary, #1677ff)";
function Xd() {
  var y, g, f;
  const e = P().React, t = ((g = (y = P()).getCurrentSessionId) == null ? void 0 : g.call(y)) || "", n = Dd(t), r = Nd(), [i, a] = e.useState(n[0]), [s, l] = e.useState("summary"), [o, d] = e.useState("steps");
  if (e.useEffect(() => {
    const x = n.find((v) => v.uiId === r);
    x && x !== i ? a(x) : n.some((v) => v.uiId === (i == null ? void 0 : i.uiId)) || a(n[0]);
  }, [n, r, i]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20, color: tr } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const c = (i == null ? void 0 : i.payload) || n[0].payload, m = c.provenance || {}, u = c.replay, p = () => {
    var v, k, M;
    const x = m.replay_token;
    x && ((M = (k = (v = window.QwenPaw) == null ? void 0 : v.chat) == null ? void 0 : k.sendMessage) == null || M.call(
      k,
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：
${x}`
    ));
  }, E = [
    ["summary", "摘要"],
    ["derivation", "推导"],
    ["evidence", "证据"],
    ["logs", "日志"]
  ], h = (x) => ({
    flex: "1 1 64px",
    minWidth: 0,
    border: "none",
    borderRadius: 7,
    padding: "6px 8px",
    background: x ? nr : "transparent",
    color: x ? _n : tr,
    boxShadow: x ? "0 1px 4px rgba(0,0,0,.08)" : "none",
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
          { style: { display: "block", color: _n } },
          "计算详情"
        ),
        e.createElement(
          "span",
          { style: { color: tr, fontSize: 11 } },
          ((f = c.trace) == null ? void 0 : f.formula_name) || c.operation || "UGSci 推导"
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
      ...E.map(
        ([x, v]) => e.createElement(
          "button",
          {
            key: x,
            type: "button",
            role: "tab",
            onClick: () => l(x),
            "aria-selected": s === x,
            style: h(s === x)
          },
          v
        )
      )
    ),
    n.length > 1 ? e.createElement(
      "select",
      {
        "aria-label": "选择计算记录",
        value: (i == null ? void 0 : i.uiId) || n[0].uiId,
        onChange: (x) => {
          Br(x.target.value), a(
            n.find((v) => v.uiId === x.target.value)
          );
        },
        style: {
          width: "100%",
          padding: "7px 9px",
          border: `1px solid ${Za}`,
          borderRadius: 7,
          color: _n,
          background: nr
        }
      },
      ...n.map(
        (x) => {
          var v;
          return e.createElement(
            "option",
            { key: x.uiId, value: x.uiId },
            ((v = x.payload.trace) == null ? void 0 : v.formula_name) || x.uiId.slice(0, 18)
          );
        }
      )
    ) : null,
    s === "summary" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 18 } },
      e.createElement(Or, {
        payload: c,
        onOpenDerivation: () => l("derivation"),
        onOpenEvidence: () => l("evidence"),
        onReplay: m.replay_token ? p : void 0
      }),
      e.createElement(Od, { payload: c })
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
          ([x, v]) => e.createElement(
            "button",
            {
              key: x,
              type: "button",
              onClick: () => d(x),
              "aria-pressed": o === x,
              style: {
                border: `1px solid ${o === x ? ei : Za}`,
                borderRadius: 7,
                padding: "5px 9px",
                background: nr,
                color: o === x ? ei : _n,
                cursor: "pointer"
              }
            },
            v
          )
        )
      ),
      o === "flow" ? e.createElement(Vd, { payload: c }) : e.createElement(Kd, { payload: c, compact: !0 })
    ) : s === "evidence" ? e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Md, { payload: c })
    ) : e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Ld, { payload: c })
    )
  );
}
function Yt(e) {
  var t;
  if (typeof e == "string")
    try {
      return Yt(JSON.parse(e));
    } catch {
      return null;
    }
  return Array.isArray(e) ? Yt((t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text) : e != null && e.status && (e != null && e.result) ? {
    ...e.result,
    replay: {
      replayId: String(e.replay_id || ""),
      status: String(e.status),
      reproducible: e.reproducible === !0,
      elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
      diff: e.diff && typeof e.diff == "object" ? e.diff : {}
    }
  } : (e == null ? void 0 : e.output) !== void 0 ? Yt(e.output) : (e == null ? void 0 : e.content) !== void 0 ? Yt(e.content) : e;
}
function Yd(e) {
  var o, d, c, m, u, p, E;
  const t = P().React, n = ((o = e == null ? void 0 : e.data) == null ? void 0 : o.content) || [], r = ((c = (d = n[1]) == null ? void 0 : d.data) == null ? void 0 : c.output) ?? ((u = (m = n[1]) == null ? void 0 : m.data) == null ? void 0 : u.content) ?? ((E = (p = n[0]) == null ? void 0 : p.data) == null ? void 0 : E.output), i = Yt(r), [a, s] = t.useState(null);
  t.useEffect(() => {
    i && s(Lr(i));
  }, [r]);
  const l = () => {
    a != null && a.uiId && Br(a.uiId), window.dispatchEvent(
      new CustomEvent("qwenpaw:open-compute-workbench", {
        detail: { uiId: a == null ? void 0 : a.uiId }
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
    i ? t.createElement(Or, {
      payload: i,
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
function Qd(e, t) {
  var i, a, s, l;
  const n = "ugsci";
  Et == null || Et();
  const r = [];
  if (pe("/ugsci/genui/config", {
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
  }), (i = e.chat) != null && i.toolRender) {
    r.push(
      e.chat.toolRender(n, "emit_ui_tree", Ba)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", Ba)
    ), r.push(
      e.chat.toolRender(n, "list_ui_components", ja)
    ), r.push(
      e.chat.toolRender(n, "get_genui_guide", ja)
    );
    for (const o of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview"
    ])
      r.push(e.chat.toolRender(n, o, Yd));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (a = e.slot) != null && a.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(Xd)
    )
  ), (l = (s = e.chat) == null ? void 0 : s.response) != null && l.append && (r.push(
    e.chat.response.append(
      n,
      (o) => {
        const d = () => (t.useEffect(
          () => Ud(o.data.output),
          [o.data.output]
        ), null);
        return t.createElement(
          Cc,
          null,
          t.createElement(d),
          t.createElement(Jd, { data: o.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), Et = () => {
    var o;
    for (const d of r.reverse()) (o = d == null ? void 0 : d.dispose) == null || o.call(d);
    if (Ac(), qc(), e.genui) {
      const d = { ...e.genui };
      delete d.dispose, delete d.clearSession, e.genui = d;
    }
    Et = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: Et,
    clearSession: $c
  }, Et;
}
const ti = {
  enabled: !0,
  persisted_enabled: !0,
  overridden: !1,
  channels: ["response.append"],
  allow_html: !1,
  allow_actions: [],
  backend_unavailable: !0
};
function rr(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function Zd() {
  const e = P().React, { Alert: t, Card: n, Space: r, Spin: i, Switch: a, Typography: s, message: l } = P().antd, { useEffect: o, useState: d } = e, [c, m] = d(null), [u, p] = d(!1);
  o(() => {
    let h = !0, y = null;
    const g = (f = !1) => {
      pe("/ugsci/genui/config").then((x) => {
        h && (m(x), rr(x));
      }).catch((x) => {
        h && (m(ti), rr(ti), f && l.error(String(x)), y = setTimeout(() => g(!1), 3e4));
      });
    };
    return g(!0), () => {
      h = !1, y && clearTimeout(y);
    };
  }, []);
  const E = async (h) => {
    p(!0);
    try {
      const y = await pe("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: h })
      });
      m(y), rr(y), l.success(
        y.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : h ? "GenUI 已开启" : "GenUI 已关闭"
      );
    } catch (y) {
      l.error(`保存 GenUI 设置失败：${String(y)}`);
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
      c === null ? e.createElement(i) : e.createElement(
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
          e.createElement(a, {
            "aria-label": "启用 GenUI",
            checked: c.persisted_enabled,
            loading: u,
            disabled: c.backend_unavailable,
            onChange: E
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
function eu() {
  const { React: e, antd: t } = P();
  return e.createElement(
    "div",
    { style: { width: "100%" } },
    e.createElement(t.Typography.Title, { level: 2 }, "UGSci 设置"),
    e.createElement(
      t.Typography.Paragraph,
      { type: "secondary", style: { marginBottom: 28 } },
      "集中管理 UGSci 的功能与偏好设置。"
    ),
    e.createElement(Zd)
  );
}
function tu() {
  const { React: e } = P();
  return e.useEffect(() => {
    window.history.replaceState({}, "", "/settings/ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, []), null;
}
let Jt = null;
function jr() {
  return Jt || (Jt = (async () => {
    var r;
    const e = (r = window.QwenPaw) == null ? void 0 : r.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = `${e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    )}`;
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((i, a) => {
      const s = document.createElement("script");
      s.dataset.plugin = "ugsci", s.src = t;
      const l = (d) => {
        clearTimeout(o), s.onload = null, s.onerror = null, d ? (s.remove(), a(d)) : i();
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
    throw Jt = null, e;
  }), Jt);
}
function Fn(e, t = {}) {
  var l;
  const n = e.getApiUrl("ugsci/visualization").replace(/\/$/, ""), r = new URL(n, window.location.href), i = new URL(
    e.getApiUrl("workspace/tree"),
    window.location.href
  ), a = t.agentId || ((l = e.getSelectedAgentId) == null ? void 0 : l.call(e)), s = {};
  return a && (s["X-Agent-Id"] = a), t.chatId ? s["X-Chat-Id"] = t.chatId : t.projectDirOverride && (s["X-Session-Project-Dir"] = t.projectDirOverride), {
    apiBase: n,
    headers: s,
    request: async (o, d) => {
      const c = new URL(
        o instanceof Request ? o.url : String(o),
        window.location.href
      ), m = c.origin === r.origin && c.pathname.startsWith(`${r.pathname}/`), u = c.origin === i.origin && c.pathname === i.pathname && ((d == null ? void 0 : d.method) || "GET").toUpperCase() === "GET";
      if (!m && !u || c.username || c.password)
        throw new Error("可视化请求超出当前数据服务范围");
      const p = new Headers(d == null ? void 0 : d.headers);
      Object.entries(s).forEach(
        ([y, g]) => p.set(y, g)
      );
      const E = e.getApiToken();
      E ? p.set("Authorization", `Bearer ${E}`) : p.delete("Authorization");
      const h = { ...d, headers: p };
      return e.fetch ? e.fetch(
        u ? `/workspace/tree${c.search}` : `/ugsci/visualization${c.pathname.slice(
          r.pathname.length
        )}${c.search}`,
        h
      ) : fetch(c.href, h);
    }
  };
}
class Nr {
  constructor(t, n, r = {}) {
    this.options = { apiBase: t, authToken: n, ...r };
  }
  update(t) {
    this.options = { ...this.options, ...t };
  }
  async request(t, n = {}) {
    const r = this.options.apiBase.replace(/\/$/, ""), i = t.startsWith(`${r}/`) ? t : `${r}/${t.replace(/^\//, "")}`, a = new Headers(this.options.headers);
    this.options.authToken && !a.has("Authorization") && a.set("Authorization", `Bearer ${this.options.authToken}`), new Headers(n.headers).forEach((l, o) => a.set(o, l));
    const s = await (this.options.request || fetch)(i, {
      ...n,
      headers: a
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
    if (r.some((i) => !i || i === "." || i === "..") || /[:?#]/.test(t))
      throw new Error("数据资源路径无效");
    return (await this.request(
      `/resource/${r.map(encodeURIComponent).join("/")}`,
      { signal: n }
    )).arrayBuffer();
  }
  async createImport(t, n, r, i) {
    const a = new FormData();
    return a.append("file", t), a.append("name", n), r && a.append("property_file", r), i && a.append("companion_file", i), (await this.request("/imports", { method: "POST", body: a })).json();
  }
  async createWorkspaceImport(t, n = "project", r = "", i) {
    const a = await (await this.request("/imports/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: t, root: n, name: r }),
      signal: i
    })).json();
    if (typeof a.job_id != "string" || !a.job_id)
      throw new Error("导入请求未返回有效任务编号");
    return a;
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
    const i = r.body.getReader(), a = new TextDecoder();
    let s = "";
    try {
      for (; ; ) {
        const { done: l, value: o } = await i.read();
        s += l ? a.decode() : a.decode(o, { stream: !0 });
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
        await i.cancel();
      } catch {
      }
      i.releaseLock();
    }
  }
}
class Pn extends Error {
  constructor(t) {
    super(t), this.name = "WorkspaceImportFailedError";
  }
}
function nu(e, t) {
  return new Promise((n, r) => {
    const i = () => {
      clearTimeout(a), r(new DOMException("已停止等待导入", "AbortError"));
    }, a = setTimeout(() => {
      t == null || t.removeEventListener("abort", i), n();
    }, e);
    t != null && t.aborted ? i() : t == null || t.addEventListener("abort", i, { once: !0 });
  });
}
async function ys(e, t, n = {}) {
  var l;
  const { signal: r, onProgress: i, attempts: a = 240, intervalMs: s = 750 } = n;
  for (let o = 0; o < a; o++) {
    r == null || r.throwIfAborted();
    const d = await e.getJobStatus(t, r);
    if (r == null || r.throwIfAborted(), !["queued", "running", "completed", "failed", "cancelled"].includes(
      d.status
    ))
      throw new Error("导入任务返回未知状态");
    if (i == null || i({
      ...d,
      progress: Number.isFinite(d.progress) ? Math.max(0, Math.min(1, d.progress)) : 0
    }), d.status === "completed") {
      if (typeof ((l = d.result) == null ? void 0 : l.id) != "string" || !d.result.id.trim())
        throw new Pn("导入完成但未返回数据集编号");
      return d.result.id;
    }
    if (d.status === "failed" || d.status === "cancelled")
      throw new Pn(
        d.error || (d.status === "cancelled" ? "导入任务已取消" : "导入失败")
      );
    o + 1 < a && await nu(s, r);
  }
  throw new Error("等待导入超时，后台任务可能仍在处理；请稍后重试查询");
}
function ru() {
  var k, M, z;
  const e = P(), t = e.React, { useEffect: n, useRef: r, useState: i } = t, { Spin: a, Alert: s, Button: l } = e.antd, o = r(null), d = r(null), c = r(null), [m, u] = i(!0), [p, E] = i(null), [h, y] = i(0), [g, f] = i("正在加载三维可视化引擎…"), x = ((k = e.useSelectedAgent) == null ? void 0 : k.call(e).id) || ((M = e.getSelectedAgentId) == null ? void 0 : M.call(e)), v = ((z = e.useLocation) == null ? void 0 : z.call(e).search) ?? window.location.search;
  return n(() => {
    const A = new AbortController();
    let T = null;
    return (async () => {
      var G, _;
      u(!0), E(null), f("正在加载三维可视化引擎…");
      try {
        const $ = new URLSearchParams(v), I = (G = $.get("path")) == null ? void 0 : G.trim(), R = {
          agentId: $.get("agentId") || x,
          chatId: $.get("chatId") || void 0,
          projectDirOverride: $.get("projectDirOverride") || void 0
        }, S = Fn(e, R);
        let j = $.get("datasetId") || void 0;
        if (I && !j) {
          const L = new Nr(
            S.apiBase,
            S.authToken,
            S
          ), N = $.get("name") || I.replace(/\\/g, "/").split("/").pop() || I;
          f(`正在导入 ${N}…`);
          const J = $.get("root") === "workspace" ? "workspace" : "project", B = JSON.stringify([
            S.apiBase,
            S.headers,
            I,
            J
          ]);
          if (((_ = c.current) == null ? void 0 : _.scope) !== B) {
            c.current = null;
            const O = await L.createWorkspaceImport(
              I,
              J,
              N.replace(/\.[^.]+$/, ""),
              A.signal
            );
            A.signal.throwIfAborted(), c.current = { scope: B, id: O.job_id };
          }
          j = await ys(L, c.current.id, {
            signal: A.signal
          });
        }
        const q = await jr();
        if (A.signal.aborted || !o.current) return;
        f("正在加载场景…"), T = q.mount(o.current, {
          ...S,
          initialDatasetId: j,
          enableCommands: !0
        }), d.current = T, await T.ready, A.signal.aborted || u(!1);
      } catch ($) {
        if (A.signal.aborted) return;
        $ instanceof Pn && (c.current = null), T == null || T.dispose(), T = null, d.current = null, E($ instanceof Error ? $.message : "可视化引擎加载失败"), u(!1);
      }
    })(), () => {
      A.abort(), T == null || T.dispose(), d.current === T && (d.current = null);
    };
  }, [h, x, v]), t.createElement(
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
      t.createElement(a, { size: "large" }),
      t.createElement("div", { style: { marginTop: 16 } }, g)
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
        { type: "primary", onClick: () => y((A) => A + 1) },
        "重试"
      )
    )
  );
}
function au({
  jobId: e,
  file: t,
  onOpen: n,
  onRetryImport: r
}) {
  const i = P(), a = i.React, { useEffect: s, useRef: l, useState: o } = a, { Button: d, Alert: c } = i.antd, m = l(null), [u, p] = o("等待后台处理…"), [E, h] = o(null), [y, g] = o(null), [f, x] = o(!1), [v, k] = o(0), [M, z] = o(!1);
  return s(() => {
    const A = new AbortController();
    let T = null;
    h(null), z(!1), x(!1), g(null);
    const F = Fn(i, t), G = new Nr(F.apiBase, F.authToken, F);
    return (async () => {
      try {
        const _ = await ys(G, e, {
          signal: A.signal,
          onProgress: (I) => p(
            `${I.status === "queued" ? "等待后台处理" : "正在解析数据"}（${Math.round(I.progress * 100)}%）`
          )
        });
        if (A.signal.aborted) return;
        g(_), p("正在加载场景…");
        const $ = await jr();
        if (A.signal.aborted || !m.current) return;
        T = $.mount(m.current, {
          ...F,
          initialDatasetId: _,
          autoLoad: !1,
          compact: !0,
          enableCommands: !1
        }), await T.ready, A.signal.aborted || x(!0);
      } catch (_) {
        if (A.signal.aborted) return;
        T == null || T.dispose(), T = null, z(_ instanceof Pn), h(_ instanceof Error ? _.message : String(_));
      }
    })(), () => {
      A.abort(), T == null || T.dispose();
    };
  }, [e, v, t.agentId, t.chatId, t.projectDirOverride]), a.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    a.createElement("div", {
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
        display: E ? "none" : "block"
      }
    }),
    !f && !E && a.createElement(
      "div",
      { role: "status", style: { padding: 12 } },
      u
    ),
    E && a.createElement(c, {
      type: "warning",
      message: "预览失败",
      description: E,
      showIcon: !0
    }),
    E && a.createElement(
      d,
      {
        onClick: () => M ? r() : k((A) => A + 1),
        style: { marginTop: 8 }
      },
      M ? "重新导入" : "重试预览"
    ),
    y && a.createElement(
      d,
      {
        type: "primary",
        onClick: () => n(y),
        style: { marginTop: 8 }
      },
      "在可视化页面展开"
    )
  );
}
function iu(e) {
  var A, T, F;
  const t = P(), n = t.React, { useEffect: r, useState: i } = n, { Button: a, Spin: s, Alert: l, Typography: o } = t.antd, d = (A = t.useNavigate) == null ? void 0 : A.call(t), c = ((T = t.useSelectedAgent) == null ? void 0 : T.call(t).id) || ((F = t.getSelectedAgentId) == null ? void 0 : F.call(t)), m = e.artifact || e.file || {}, u = {
    ...m,
    agentId: m.agentId || c
  }, p = u.filename || u.title || e.filename || "未命名文件", E = u.workspacePath || u.path || e.workspacePath, h = JSON.stringify([
    E,
    p,
    u.workspaceRoot,
    u.agentId,
    u.chatId,
    u.projectDirOverride
  ]), [y, g] = i(null), f = (y == null ? void 0 : y.key) === h ? y.id : null, [x, v] = i(null), [k, M] = i(0);
  r(() => {
    const G = new AbortController();
    if (g(null), v(null), !E) {
      v("文件缺少工作区路径，无法导入预览");
      return;
    }
    const _ = Fn(t, u);
    return new Nr(_.apiBase, _.authToken, _).createWorkspaceImport(
      E,
      u.workspaceRoot || "project",
      p.replace(/\.[^.]+$/, ""),
      G.signal
    ).then((I) => {
      G.signal.aborted || g({ id: I.job_id, key: h });
    }).catch((I) => {
      G.signal.aborted || v(I instanceof Error ? I.message : String(I));
    }), () => G.abort();
  }, [h, k]);
  const z = (G) => {
    if (!d) {
      v("当前宿主未提供页面导航，请从侧栏打开油气可视化");
      return;
    }
    const _ = new URLSearchParams({ datasetId: G }), $ = u.agentId;
    $ && _.set("agentId", $), u.chatId ? _.set("chatId", u.chatId) : u.projectDirOverride && _.set("projectDirOverride", u.projectDirOverride), d(`/oilgas-visualization?${_}`);
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
    !f && !x && n.createElement(s, { tip: "正在提交工作区文件…" }),
    x && n.createElement(l, {
      type: "warning",
      message: "预览提示",
      description: x,
      showIcon: !0
    }),
    x && !f && E && n.createElement(
      a,
      { onClick: () => M((G) => G + 1) },
      "重试导入"
    ),
    f && n.createElement(au, {
      key: `${f}:${u.agentId || ""}:${u.chatId || ""}:${u.projectDirOverride || ""}`,
      jobId: f,
      file: u,
      onOpen: z,
      onRetryImport: () => M((G) => G + 1)
    })
  );
}
async function su(e, t = {}) {
  const { scope: n, signal: r, ...i } = t;
  r == null || r.throwIfAborted();
  const a = Fn(P(), n), s = await jr();
  return r == null || r.throwIfAborted(), s.mount(e, {
    ...a,
    autoLoad: !1,
    enableCommands: !1,
    ...i
  });
}
function ou(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0, e.ugsci = {
    ...e.ugsci,
    visualization: { version: 1, mount: su }
  };
  const i = P().antdIcons || {}, a = i.GlobalOutlined || i.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: ru,
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
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.visualization",
    order: 7,
    visible: () => !0
  });
  const s = e.workspace;
  if (s != null && s.registerRenderer)
    try {
      s.registerRenderer({
        id: "ugsci.visualization",
        name: "UGSci 油气可视化",
        component: iu,
        extensions: [
          "egrid",
          "grid",
          "grdecl",
          "init",
          "unrst",
          "roff",
          "roffbin",
          "dat",
          "sr3",
          "irf",
          "data",
          "model",
          "tnav",
          "tpr",
          "las",
          "las3",
          "dlis",
          "vtk",
          "vtu",
          "pvtu",
          "vti",
          "xdmf",
          "csv",
          "arrow",
          "parquet",
          "well.json",
          "surface.json",
          "network.json",
          "json"
        ],
        mimeTypes: [
          "application/x-eclipse-grid",
          "application/x-eclipse-init",
          "application/x-eclipse-unrst",
          "application/x-cmg-dat",
          "application/x-cmg-sr3",
          "application/x-tnavigator-data",
          "application/x-roff",
          "application/x-las",
          "application/x-dlis",
          "application/vnd.vtk",
          "application/x-vtu",
          "application/x-pvtu",
          "application/x-xdmf",
          "text/csv",
          "application/vnd.apache.arrow.file"
        ],
        priority: 200,
        description: "UGSci 油气三维网格、井、剖面和测井可视化"
      });
    } catch (l) {
      console.warn(
        "[ugsci] Visualization workspace renderer registration failed:",
        l
      );
    }
}
const lu = /* @__PURE__ */ new Set([
  "launch_simulation",
  "check_simulation_status",
  "wait_for_simulation",
  "read_simulation_results",
  "analyze_simulation"
]), cu = /* @__PURE__ */ new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output",
  "tool_result"
]);
function du(e) {
  const t = /* @__PURE__ */ new Map(), n = (i, a = 0) => {
    if (!(a > 16 || i == null)) {
      if (typeof i == "string") {
        if (i.length > 2e5) return;
        try {
          n(JSON.parse(i), a + 1);
        } catch {
          for (const s of i.matchAll(
            /<ugsci-simulation-ref>([\s\S]{1,4096}?)<\/ugsci-simulation-ref>/g
          ))
            try {
              n(JSON.parse(s[1]), a + 1);
            } catch {
            }
        }
      } else if (Array.isArray(i))
        i.forEach((s) => n(s, a + 1));
      else if (typeof i == "object")
        if (i.kind === "ugsci_simulation" && i.schema_version === 1 && typeof i.run_id == "string" && /^[\w:.-]{1,160}$/.test(i.run_id))
          t.set(i.run_id, {
            kind: "ugsci_simulation",
            run_id: i.run_id,
            simulator: typeof i.simulator == "string" ? i.simulator : void 0,
            agent_id: typeof i.agent_id == "string" ? i.agent_id : void 0,
            session_id: typeof i.session_id == "string" ? i.session_id : void 0
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
            n(i[s], a + 1);
    }
  }, r = (i, a = 0) => {
    var s;
    if (!(!i || typeof i != "object" || a > 16)) {
      if (Array.isArray(i)) {
        i.forEach((l) => r(l, a + 1));
        return;
      }
      if (!(i.role === "user" || i.role === "system")) {
        if (cu.has(i.type)) {
          const l = Array.isArray(i.content) ? i.content : [];
          [
            (s = i.data) == null ? void 0 : s.name,
            ...l.map((d) => {
              var c;
              return (c = d == null ? void 0 : d.data) == null ? void 0 : c.name;
            }),
            i.name
          ].some((d) => lu.has(d)) && n(i);
          return;
        }
        for (const l of ["output", "content", "data"])
          r(i[l], a + 1);
      }
    }
  };
  return r(e), [...t.values()];
}
function uu({ reference: e }) {
  var M, z, A, T, F, G;
  const t = P(), n = t.React, { Button: r } = t.antd, [i, a] = n.useState(!1), [s, l] = n.useState(!1), o = n.useId(), d = `${o}-details`, c = `${o}-results`, [, m] = n.useState(0), u = (M = t.useNavigate) == null ? void 0 : M.call(t), p = ((A = (z = t.useSelectedAgent) == null ? void 0 : z.call(t)) == null ? void 0 : A.id) || ((T = t.getSelectedAgentId) == null ? void 0 : T.call(t)) || "default", E = ((F = t.getCurrentSessionId) == null ? void 0 : F.call(t)) || "", h = e.agent_id || p, y = p === h, g = `数模任务 · ${e.simulator || "模拟计算"}`, f = {
    borderRadius: "var(--app-radius, 10px)",
    minHeight: 34,
    height: "auto",
    padding: "6px 14px",
    fontSize: "var(--app-font-secondary, 13px)",
    lineHeight: 1.5,
    whiteSpace: "normal"
  };
  n.useEffect(() => {
    const _ = () => m(($) => $ + 1);
    return window.addEventListener("qwenpaw:simulation-monitor-ready", _), () => window.removeEventListener("qwenpaw:simulation-monitor-ready", _);
  }, []);
  const x = window.QwenPaw, v = (G = x == null ? void 0 : x.runCenter) == null ? void 0 : G.SimulationMonitor, k = () => window.dispatchEvent(
    new CustomEvent("qwenpaw:open-simulation-workbench", {
      detail: { runId: e.run_id, agentId: h, sessionId: E }
    })
  );
  return n.createElement(
    "section",
    {
      "aria-label": g,
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
        g
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
    !y && n.createElement(
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
          style: f,
          disabled: !y,
          "aria-expanded": i,
          "aria-controls": c,
          onClick: () => a((_) => !_)
        },
        i ? "收起结果" : "查看结果"
      ),
      n.createElement(
        r,
        { style: f, disabled: !y, onClick: k },
        "在侧栏监测"
      ),
      u && n.createElement(
        r,
        {
          type: "text",
          style: f,
          disabled: !y,
          onClick: () => u(
            `/run-center?run_id=${encodeURIComponent(e.run_id)}`
          )
        },
        "打开运行中心"
      )
    ),
    i && y && n.createElement(
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
        scope: { agentId: h, chatId: E }
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
        ["所属智能体", h],
        ["来源会话", e.session_id || E]
      ].filter(([, _]) => _).flatMap(([_, $]) => [
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
          $
        )
      ])
    )
  );
}
function mu({ data: e }) {
  const t = P().React;
  return t.createElement(
    t.Fragment,
    null,
    ...du(e.output).map(
      (n) => t.createElement(uu, { key: n.run_id, reference: n })
    )
  );
}
function pu(e, t) {
  var r, i, a, s;
  (r = e.ugsciSimulationDispose) == null || r.call(e);
  const n = (s = (a = (i = e.chat) == null ? void 0 : i.response) == null ? void 0 : a.append) == null ? void 0 : s.call(
    a,
    "ugsci",
    ({ data: l }) => t.createElement(mu, { data: l }),
    { id: "ugsci.simulation.response-append", order: 60 }
  );
  e.ugsciSimulationDispose = () => {
    var l;
    return (l = n == null ? void 0 : n.dispose) == null ? void 0 : l.call(n);
  };
}
const Vt = "/ugsci/storage-dynamics", ni = (e) => e === "injection" ? "注气" : "采气", Ue = (e) => e == null ? "缺测" : e.toLocaleString("zh-CN", { maximumFractionDigits: 2 }), gu = {
  xls_row_limit: "疑似 XLS 导出截断",
  invalid_range: "数值超出合法范围",
  invalid_number: "无法识别数值",
  invalid_identity: "日期或库井标识无效",
  duplicate_identical: "相同重复已去重",
  duplicate_conflict: "重复冲突已排除"
}, fu = {
  gas: "日气量",
  hours: "生产小时",
  pressure: "井口油压",
  casing: "套压",
  water: "日产水量",
  vent: "放空量"
};
function yu({ rows: e }) {
  const t = P().React, n = [...new Set(e.map((o) => o.month))].sort(), r = n.map((o) => {
    const d = e.filter((m) => m.month === o), c = (m) => {
      const u = d.map((p) => p[m]).filter((p) => p != null);
      return u.length ? u.reduce((p, E) => p + E, 0) : null;
    };
    return {
      month: o,
      injection: c("injection"),
      withdrawal: c("withdrawal")
    };
  }), i = Math.max(
    1,
    ...r.flatMap((o) => [o.injection || 0, o.withdrawal || 0])
  ), a = (o) => 65 + o * 635 / Math.max(1, n.length - 1), s = (o) => 245 - o / i * 200, l = (o) => {
    let d = !1;
    return r.map((c, m) => {
      if (c[o] == null)
        return d = !1, "";
      const u = `${d ? "L" : "M"}${a(m)},${s(c[o])}`;
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
        y1: s(o * i),
        y2: s(o * i),
        stroke: "currentColor",
        opacity: ".12"
      }
    ), /* @__PURE__ */ t.createElement(
      "text",
      {
        x: "57",
        y: s(o * i) + 4,
        textAnchor: "end",
        fill: "currentColor",
        fontSize: "12"
      },
      Ue(o * i)
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
        x: a(d),
        y: "274",
        textAnchor: "middle",
        fill: "currentColor",
        fontSize: "12"
      },
      o.month
    ), /* @__PURE__ */ t.createElement("rect", { x: a(d) - 3, y: "40", width: "6", height: "205", fill: "transparent" }, /* @__PURE__ */ t.createElement("title", null, o.month, " 注气 ", Ue(o.injection), " / 采气 ", Ue(o.withdrawal), " ", "万m³"))))
  ));
}
function hu() {
  const e = P(), t = e.React, {
    Card: n,
    Select: r,
    Input: i,
    Button: a,
    Space: s,
    Alert: l,
    Table: o,
    Tabs: d,
    Statistic: c,
    Spin: m,
    DatePicker: u,
    InputNumber: p,
    Typography: E
  } = e.antd, [h, y] = t.useState([]), [g, f] = t.useState(""), [x, v] = t.useState(""), [k, M] = t.useState(""), [z, A] = t.useState(""), [T, F] = t.useState(""), [G, _] = t.useState(""), [$, I] = t.useState(4), [R, S] = t.useState(30), [j, q] = t.useState(null), [L, N] = t.useState(null), [J, B] = t.useState(""), [O, K] = t.useState(""), U = t.useRef(!0), ie = async (D) => {
    var de;
    const me = await pe(`${Vt}/datasets`, {
      bypassCache: !0
    });
    if (!U.current) return;
    const ve = me.datasets.sort(
      (Y, be) => be.created_at.localeCompare(Y.created_at)
    );
    y(ve), f(D || ((de = ve[0]) == null ? void 0 : de.id) || "");
  };
  t.useEffect(() => (U.current = !0, ie().catch((D) => {
    U.current && K(String(D.message || D));
  }), () => {
    U.current = !1;
  }), []);
  const ue = () => ({
    dataset_id: g,
    facility: k,
    well: z,
    start: T,
    end: G,
    cycle_start_month: $,
    drop_threshold_pct: R
  }), le = async () => {
    K(""), B("读取并审计数据…");
    try {
      const D = await pe(`${Vt}/imports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_path: x })
      });
      for (; U.current; ) {
        await new Promise((ve) => setTimeout(ve, 1200));
        const me = await pe(`${Vt}/imports/${D.id}`, {
          bypassCache: !0
        });
        if (me.status === "failed") throw new Error(me.error);
        if (me.status === "completed") {
          await ie(me.dataset.id), q(null), M(""), A("");
          break;
        }
      }
    } catch (D) {
      U.current && K(D.message || String(D));
    } finally {
      U.current && B("");
    }
  }, ae = async () => {
    K(""), B("分析注采动态…");
    const D = ue();
    try {
      const me = await pe(`${Vt}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(D)
      });
      U.current && (q(me), N(D));
    } catch (me) {
      U.current && K(me.message || String(me));
    } finally {
      U.current && B("");
    }
  }, Q = async () => {
    if (L) {
      B("生成报告…"), K("");
      try {
        const D = await ct(`${Vt}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(L)
        });
        if (!D.ok) throw new Error(await D.text());
        const me = URL.createObjectURL(await D.blob()), ve = document.createElement("a");
        ve.href = me, ve.download = "储气库生产动态分析报告.md", ve.click(), setTimeout(() => URL.revokeObjectURL(me), 1e3);
      } catch (D) {
        K(D.message || String(D));
      } finally {
        U.current && B("");
      }
    }
  }, W = h.find((D) => D.id === g), ee = (D, me, ve) => /* @__PURE__ */ t.createElement(
    o,
    {
      size: "small",
      dataSource: D,
      columns: me,
      rowKey: ve,
      pagination: { pageSize: 12, showSizeChanger: !0 },
      scroll: { x: "max-content" }
    }
  ), X = (D, me, ve) => ({ title: D, dataIndex: me, render: ve });
  return /* @__PURE__ */ t.createElement("div", { style: { padding: 24, maxWidth: 1600, margin: "0 auto" } }, /* @__PURE__ */ t.createElement(E.Title, { level: 2, style: { marginTop: 0 } }, "储气库生产动态分析"), /* @__PURE__ */ t.createElement(E.Paragraph, { type: "secondary" }, "从注采日记录到库井动态、运行阶段与复核线索。保留计量口径，每个异常可追溯到原表。"), /* @__PURE__ */ t.createElement(n, { title: "数据与分析范围", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(s.Compact, { style: { width: "100%", marginBottom: 16 } }, /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "注采数据路径",
      value: x,
      onChange: (D) => v(D.target.value),
      placeholder: "本地 XLS / XLSX / UTF-8 CSV 文件或目录的绝对路径",
      disabled: !!J
    }
  ), /* @__PURE__ */ t.createElement(a, { onClick: le, disabled: !x.trim() || !!J }, "导入并检查")), /* @__PURE__ */ t.createElement(s, { wrap: !0, style: { marginBottom: 12 } }, /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "数据集",
      style: { minWidth: 260 },
      placeholder: "选择数据集",
      value: g || void 0,
      disabled: !!J,
      onChange: (D) => {
        f(D), M(""), A(""), q(null);
      },
      options: h.map((D) => ({
        label: `${D.name} · ${Ue(D.records)} 条`,
        value: D.id
      }))
    }
  ), /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "储气库",
      value: k,
      style: { minWidth: 145 },
      disabled: !!J,
      onChange: (D) => {
        M(D), A("");
      },
      options: [
        { label: "全部储气库", value: "" },
        ...((W == null ? void 0 : W.facilities) || []).map((D) => ({
          label: D.facility,
          value: D.facility
        }))
      ]
    }
  ), /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "井号",
      value: z,
      onChange: (D) => A(D.target.value),
      placeholder: "原始井号（可选）",
      style: { width: 150 },
      disabled: !!J
    }
  ), /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "起始日期",
      type: "date",
      value: T,
      onChange: (D) => F(D.target.value),
      disabled: !!J,
      style: { width: 155 }
    }
  ), /* @__PURE__ */ t.createElement("span", null, "至"), /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "截止日期",
      type: "date",
      value: G,
      onChange: (D) => _(D.target.value),
      disabled: !!J,
      style: { width: 155 }
    }
  )), /* @__PURE__ */ t.createElement(s, { wrap: !0 }, /* @__PURE__ */ t.createElement("span", null, "气年度起始月"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "气年度起始月份",
      min: 1,
      max: 12,
      value: $,
      disabled: !!J,
      onChange: (D) => I(D || 4)
    }
  ), /* @__PURE__ */ t.createElement("span", null, "折算量下降筛查阈值（%）"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "下降筛查阈值",
      min: 1,
      max: 100,
      value: R,
      disabled: !!J,
      onChange: (D) => S(D || 30)
    }
  ), /* @__PURE__ */ t.createElement(a, { type: "primary", onClick: ae, disabled: !g || !!J }, "分析动态"), /* @__PURE__ */ t.createElement(a, { onClick: Q, disabled: !j || !!J }, "下载分析报告"))), O && /* @__PURE__ */ t.createElement(
    l,
    {
      type: "error",
      showIcon: !0,
      message: O,
      style: { marginBottom: 16 }
    }
  ), J && /* @__PURE__ */ t.createElement("div", { role: "status", style: { padding: 16 } }, /* @__PURE__ */ t.createElement(m, { size: "small" }), " ", J), !j && !J && /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(E.Paragraph, null, "选择已导入数据集并点击“分析动态”。也可以在专家中心创建“储气库生产动态分析师”，通过对话调用相同的分析工具。"), /* @__PURE__ */ t.createElement(
    l,
    {
      type: "info",
      showIcon: !0,
      message: "源文件只读；空值不补零，井口油压不替代地层压力。"
    }
  )), j && /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(
    l,
    {
      type: "info",
      showIcon: !0,
      message: `分析截至数据日期 ${j.summary.as_of} · ${j.filters.facility || "全部库"} / ${j.filters.well || "全部井"} · ${j.summary.start} 起 · 气年度 ${j.parameters.cycle_start_month} 月起 · 筛查阈值 ${j.parameters.drop_threshold_pct}%`,
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
        `${j.summary.facilities} / ${j.summary.wells}`,
        ""
      ],
      ["已记录累计注气", Ue(j.summary.injection), "万m³"],
      ["已记录累计采气", Ue(j.summary.withdrawal), "万m³"],
      ["气量缺测日记录", Ue(j.summary.missing_gas), "条"],
      ["筛查线索", Ue(j.summary.anomaly_count), "项"]
    ].map(([D, me, ve]) => /* @__PURE__ */ t.createElement(n, { key: D, size: "small" }, /* @__PURE__ */ t.createElement(c, { title: D, value: me, suffix: ve })))
  ), /* @__PURE__ */ t.createElement(n, { title: "注采月度动态", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(yu, { rows: j.monthly }), /* @__PURE__ */ t.createElement(E.Text, { type: "secondary" }, "未记录的一侧保持缺测。累计注采差额需要完整历史与期初库存才能参与库存核算。")), /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(
    d,
    {
      items: [
        {
          key: "coverage",
          label: "数据覆盖与质量",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, ee(
            j.coverage,
            [
              X("储气库", "facility"),
              X("方向", "mode", ni),
              X("起始日期", "start"),
              X("截止日期", "end"),
              X("记录数", "records", Ue),
              X("气量缺测", "missing_gas", Ue),
              X("计量量 / 万m³", "observed_volume", Ue)
            ],
            (D) => `${D.facility}-${D.mode}`
          ), /* @__PURE__ */ t.createElement(
            l,
            {
              type: "warning",
              showIcon: !0,
              message: "分析口径与数据限制",
              description: /* @__PURE__ */ t.createElement("ul", null, j.warnings.map((D, me) => /* @__PURE__ */ t.createElement("li", { key: me }, D)))
            }
          ), /* @__PURE__ */ t.createElement(E.Paragraph, { style: { marginTop: 12 } }, "整个数据集导入检查：", Object.entries(j.quality.import_counts).map(([D, me]) => `${gu[D] || D} ${me} 项`).join("；") || "未发现已配置检查项中的问题", "。下方最多显示 100 条原表问题样例。"), ee(
            j.quality.examples,
            [
              X("问题", "message"),
              X(
                "字段",
                "field",
                (D) => fu[D] || D || "—"
              ),
              X("文件", "file"),
              X("表", "sheet"),
              X("原行号", "row")
            ],
            (D) => `${D.file}-${D.sheet}-${D.row}-${D.code}-${D.field}`
          ))
        },
        {
          key: "cycles",
          label: "气年度与阶段",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, ee(
            j.cycles,
            [
              X("储气库", "facility"),
              X("气年度", "gas_year"),
              X("注气 / 万m³", "injection", Ue),
              X("采气 / 万m³", "withdrawal", Ue),
              X("净计量变化 / 万m³", "net_metered_change", Ue),
              X(
                "水气质量比 / t/万m³",
                "water_gas_mass_ratio",
                Ue
              ),
              X("覆盖状态", "completeness")
            ],
            (D) => `${D.facility}-${D.gas_year}`
          ), /* @__PURE__ */ t.createElement(E.Title, { level: 5 }, "近期运行阶段（按实测记录）"), ee(
            j.phases_recent,
            [
              X("库", "facility"),
              X(
                "状态",
                "state",
                (D) => ({
                  injection: "注气",
                  withdrawal: "采气",
                  mixed: "混合",
                  zero_observed: "已观测零气量",
                  unknown: "气量未知"
                })[D] || D
              ),
              X("起始", "start"),
              X("截止", "end"),
              X("连续观测日", "observed_days")
            ],
            (D) => `${D.facility}-${D.start}`
          ))
        },
        {
          key: "wells",
          label: "井动态与短期基线",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, ee(
            j.wells,
            [
              X("库", "facility"),
              X("井号", "well"),
              X("方向", "mode", ni),
              X("运行日", "active_days", Ue),
              X("累计计量 / 万m³", "observed_volume", Ue),
              X("最近运行日期", "last_active_date"),
              X("折算量变化 / %", "rate_change_pct", Ue),
              X("井口油压变化 / %", "pressure_change_pct", Ue),
              X(
                "条件性日量基线 / 万m³",
                "forecast",
                (D) => Ue(D == null ? void 0 : D.daily_volume)
              ),
              X(
                "滚动回测 MAE / 万m³",
                "forecast",
                (D) => Ue(D == null ? void 0 : D.backtest_mae)
              ),
              X("基线状态", "forecast_reason")
            ],
            (D) => `${D.facility}-${D.well}-${D.mode}`
          ), /* @__PURE__ */ t.createElement(E.Text, { type: "secondary" }, "短期基线仅限保持工况的 7 日分析；停井、缺测与日期断档会断开阶段。回测仅使用预测时点之前的记录。"))
        },
        {
          key: "anomalies",
          label: "复核线索",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(E.Paragraph, null, "共 ", Ue(j.summary.anomaly_count), " ", "项筛查线索，显示最近 100 项。线索需要结合现场调度与工程资料复核。"), ee(
            j.anomalies,
            [
              X("日期", "day"),
              X("库", "facility"),
              X("井号", "well"),
              X("线索", "message"),
              X("变化 / %", "rate_change_pct", Ue),
              X(
                "原表位置",
                "source",
                (D) => `${D.file} / ${D.sheet} / 第 ${D.row} 行`
              )
            ],
            (D) => `${D.facility}-${D.well}-${D.day}-${D.code}`
          ))
        }
      ]
    }
  ))));
}
function Eu() {
  var o, d, c, m;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = P().React, n = "ugsci";
  pu(e, t);
  function r() {
    return P().React.createElement(vc, { embedded: !0 });
  }
  function i() {
    return P().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (d = (o = e.chat) == null ? void 0 : o.rightHeader) != null && d.add ? (e.chat.rightHeader.add(
    n,
    t.createElement(xc),
    {
      id: "ugsci.welcome-injector",
      order: -1
      // render before other right-header items (invisible anyway)
    }
  ), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = P().antdIcons || {}, s = a.UserSwitchOutlined, l = a.ToolOutlined;
  e.route.add(n, {
    id: "ugsci.storage-dynamics",
    path: "/ugsci-storage-dynamics",
    component: hu
  }), e.menu.add(n, {
    id: "ugsci.storage-dynamics",
    location: "primary.agentScoped",
    label: () => "储气库动态",
    icon: a.LineChartOutlined ? t.createElement(a.LineChartOutlined, {
      style: { fontSize: 16 }
    }) : void 0,
    route: "ugsci.storage-dynamics",
    order: 7
  }), e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: hl
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5
  }), e.route.add(n, {
    id: "ugsci.settings",
    path: "/ugsci-settings",
    component: eu
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: tu
  }), e.route.add(n, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: ji
  }), e.menu.add(n, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Vl
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Kl
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: i
  }), (c = e.marketplace) == null || c.add(n, {
    id: "ugsci",
    label: "UGSci",
    component: r,
    order: 30
  }), (m = e.sidebar) != null && m.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.tools-skills",
    "ugsci.storage-dynamics"
  ]), console.info(
    "[ugsci] Registered 3 entries for legacy simple-mode compatibility"
  )) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  try {
    const p = e.menu.snapshot("primary.agentScoped").find((E) => E.id === "oilgas-vis.page");
    p && e.menu.replace(n, "oilgas-vis.page", {
      ...p,
      visible: () => !1
    });
  } catch {
  }
  Qd(e, t), ou(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, host-managed navigation"
  );
}
function br() {
  try {
    Eu();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(br, 500);
  }
}
var di;
if ((di = window.QwenPaw) != null && di.host)
  br();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), br());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function bu(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), i = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(i), t && (r.href = t), i.href = e, i.href;
}
const vu = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function ft(e) {
  const t = [];
  for (let n = 0, r = e.length; n < r; n++)
    t.push(e[n]);
  return t;
}
let It = null;
function hs(e = {}) {
  return It || (e.includeStyleProperties ? (It = e.includeStyleProperties, It) : (It = ft(window.getComputedStyle(document.documentElement)), It));
}
function On(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function wu(e) {
  const t = On(e, "border-left-width"), n = On(e, "border-right-width");
  return e.clientWidth + t + n;
}
function xu(e) {
  const t = On(e, "border-top-width"), n = On(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function Es(e, t = {}) {
  const n = t.width || wu(e), r = t.height || xu(e);
  return { width: n, height: r };
}
function Su() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const Ze = 16384;
function ku(e) {
  (e.width > Ze || e.height > Ze) && (e.width > Ze && e.height > Ze ? e.width > e.height ? (e.height *= Ze / e.width, e.width = Ze) : (e.width *= Ze / e.height, e.height = Ze) : e.width > Ze ? (e.height *= Ze / e.width, e.width = Ze) : (e.width *= Ze / e.height, e.height = Ze));
}
function Mn(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function _u(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function Cu(e, t, n) {
  const r = "http://www.w3.org/2000/svg", i = document.createElementNS(r, "svg"), a = document.createElementNS(r, "foreignObject");
  return i.setAttribute("width", `${t}`), i.setAttribute("height", `${n}`), i.setAttribute("viewBox", `0 0 ${t} ${n}`), a.setAttribute("width", "100%"), a.setAttribute("height", "100%"), a.setAttribute("x", "0"), a.setAttribute("y", "0"), a.setAttribute("externalResourcesRequired", "true"), i.appendChild(a), a.appendChild(e), _u(i);
}
const Xe = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Xe(n, t);
};
function Tu(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Iu(e, t) {
  return hs(t).map((n) => {
    const r = e.getPropertyValue(n), i = e.getPropertyPriority(n);
    return `${n}: ${r}${i ? " !important" : ""};`;
  }).join(" ");
}
function $u(e, t, n, r) {
  const i = `.${e}:${t}`, a = n.cssText ? Tu(n) : Iu(n, r);
  return document.createTextNode(`${i}{${a}}`);
}
function ri(e, t, n, r) {
  const i = window.getComputedStyle(e, n), a = i.getPropertyValue("content");
  if (a === "" || a === "none")
    return;
  const s = vu();
  try {
    t.className = `${t.className} ${s}`;
  } catch {
    return;
  }
  const l = document.createElement("style");
  l.appendChild($u(s, n, i, r)), t.appendChild(l);
}
function Au(e, t, n) {
  ri(e, t, ":before", n), ri(e, t, ":after", n);
}
const ai = "application/font-woff", ii = "image/jpeg", zu = {
  woff: ai,
  woff2: ai,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: ii,
  jpeg: ii,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function Ru(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function Ur(e) {
  const t = Ru(e).toLowerCase();
  return zu[t] || "";
}
function Pu(e) {
  return e.split(/,/)[1];
}
function vr(e) {
  return e.search(/^(data:)/) !== -1;
}
function Ou(e, t) {
  return `data:${t};base64,${e}`;
}
async function bs(e, t, n) {
  const r = await fetch(e, t);
  if (r.status === 404)
    throw new Error(`Resource "${r.url}" not found`);
  const i = await r.blob();
  return new Promise((a, s) => {
    const l = new FileReader();
    l.onerror = s, l.onloadend = () => {
      try {
        a(n({ res: r, result: l.result }));
      } catch (o) {
        s(o);
      }
    }, l.readAsDataURL(i);
  });
}
const ar = {};
function Mu(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function Dr(e, t, n) {
  const r = Mu(e, t, n.includeQueryParams);
  if (ar[r] != null)
    return ar[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let i;
  try {
    const a = await bs(e, n.fetchRequestInit, ({ res: s, result: l }) => (t || (t = s.headers.get("Content-Type") || ""), Pu(l)));
    i = Ou(a, t);
  } catch (a) {
    i = n.imagePlaceholder || "";
    let s = `Failed to fetch resource: ${e}`;
    a && (s = typeof a == "string" ? a : a.message), s && console.warn(s);
  }
  return ar[r] = i, i;
}
async function Lu(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : Mn(t);
}
async function Bu(e, t) {
  if (e.currentSrc) {
    const a = document.createElement("canvas"), s = a.getContext("2d");
    a.width = e.clientWidth, a.height = e.clientHeight, s == null || s.drawImage(e, 0, 0, a.width, a.height);
    const l = a.toDataURL();
    return Mn(l);
  }
  const n = e.poster, r = Ur(n), i = await Dr(n, r, t);
  return Mn(i);
}
async function ju(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await Gn(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function Nu(e, t) {
  return Xe(e, HTMLCanvasElement) ? Lu(e) : Xe(e, HTMLVideoElement) ? Bu(e, t) : Xe(e, HTMLIFrameElement) ? ju(e, t) : e.cloneNode(vs(e));
}
const Uu = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", vs = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function Du(e, t, n) {
  var r, i;
  if (vs(t))
    return t;
  let a = [];
  return Uu(e) && e.assignedNodes ? a = ft(e.assignedNodes()) : Xe(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? a = ft(e.contentDocument.body.childNodes) : a = ft(((i = e.shadowRoot) !== null && i !== void 0 ? i : e).childNodes), a.length === 0 || Xe(e, HTMLVideoElement) || await a.reduce((s, l) => s.then(() => Gn(l, n)).then((o) => {
    o && t.appendChild(o);
  }), Promise.resolve()), t;
}
function Fu(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const i = window.getComputedStyle(e);
  i.cssText ? (r.cssText = i.cssText, r.transformOrigin = i.transformOrigin) : hs(n).forEach((a) => {
    let s = i.getPropertyValue(a);
    a === "font-size" && s.endsWith("px") && (s = `${Math.floor(parseFloat(s.substring(0, s.length - 2))) - 0.1}px`), Xe(e, HTMLIFrameElement) && a === "display" && s === "inline" && (s = "block"), a === "d" && t.getAttribute("d") && (s = `path(${t.getAttribute("d")})`), r.setProperty(a, s, i.getPropertyPriority(a));
  });
}
function Gu(e, t) {
  Xe(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Xe(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function Wu(e, t) {
  if (Xe(e, HTMLSelectElement)) {
    const n = t, r = Array.from(n.children).find((i) => e.value === i.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function qu(e, t, n) {
  return Xe(t, Element) && (Fu(e, t, n), Au(e, t, n), Gu(e, t), Wu(e, t)), t;
}
async function Hu(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let a = 0; a < n.length; a++) {
    const l = n[a].getAttribute("xlink:href");
    if (l) {
      const o = e.querySelector(l), d = document.querySelector(l);
      !o && d && !r[l] && (r[l] = await Gn(d, t, !0));
    }
  }
  const i = Object.values(r);
  if (i.length) {
    const a = "http://www.w3.org/1999/xhtml", s = document.createElementNS(a, "svg");
    s.setAttribute("xmlns", a), s.style.position = "absolute", s.style.width = "0", s.style.height = "0", s.style.overflow = "hidden", s.style.display = "none";
    const l = document.createElementNS(a, "defs");
    s.appendChild(l);
    for (let o = 0; o < i.length; o++)
      l.appendChild(i[o]);
    e.appendChild(s);
  }
  return e;
}
async function Gn(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => Nu(r, t)).then((r) => Du(e, r, t)).then((r) => qu(e, r, t)).then((r) => Hu(r, t));
}
const ws = /url\((['"]?)([^'"]+?)\1\)/g, Ju = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Vu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Ku(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function Xu(e) {
  const t = [];
  return e.replace(ws, (n, r, i) => (t.push(i), n)), t.filter((n) => !vr(n));
}
async function Yu(e, t, n, r, i) {
  try {
    const a = n ? bu(t, n) : t, s = Ur(t);
    let l;
    return i || (l = await Dr(a, s, r)), e.replace(Ku(t), `$1${l}$3`);
  } catch {
  }
  return e;
}
function Qu(e, { preferredFontFormat: t }) {
  return t ? e.replace(Vu, (n) => {
    for (; ; ) {
      const [r, , i] = Ju.exec(n) || [];
      if (!i)
        return "";
      if (i === t)
        return `src: ${r};`;
    }
  }) : e;
}
function xs(e) {
  return e.search(ws) !== -1;
}
async function Ss(e, t, n) {
  if (!xs(e))
    return e;
  const r = Qu(e, n);
  return Xu(r).reduce((a, s) => a.then((l) => Yu(l, s, t, n)), Promise.resolve(r));
}
async function $t(e, t, n) {
  var r;
  const i = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (i) {
    const a = await Ss(i, null, n);
    return t.style.setProperty(e, a, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function Zu(e, t) {
  await $t("background", e, t) || await $t("background-image", e, t), await $t("mask", e, t) || await $t("-webkit-mask", e, t) || await $t("mask-image", e, t) || await $t("-webkit-mask-image", e, t);
}
async function em(e, t) {
  const n = Xe(e, HTMLImageElement);
  if (!(n && !vr(e.src)) && !(Xe(e, SVGImageElement) && !vr(e.href.baseVal)))
    return;
  const r = n ? e.src : e.href.baseVal, i = await Dr(r, Ur(r), t);
  await new Promise((a, s) => {
    e.onload = a, e.onerror = t.onImageErrorHandler ? (...o) => {
      try {
        a(t.onImageErrorHandler(...o));
      } catch (d) {
        s(d);
      }
    } : s;
    const l = e;
    l.decode && (l.decode = a), l.loading === "lazy" && (l.loading = "eager"), n ? (e.srcset = "", e.src = i) : e.href.baseVal = i;
  });
}
async function tm(e, t) {
  const r = ft(e.childNodes).map((i) => ks(i, t));
  await Promise.all(r).then(() => e);
}
async function ks(e, t) {
  Xe(e, Element) && (await Zu(e, t), await em(e, t), await tm(e, t));
}
function nm(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((i) => {
    n[i] = r[i];
  }), e;
}
const si = {};
async function oi(e) {
  let t = si[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, si[e] = t, t;
}
async function li(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, a = (n.match(/url\([^)]+\)/g) || []).map(async (s) => {
    let l = s.replace(r, "$1");
    return l.startsWith("https://") || (l = new URL(l, e.url).href), bs(l, t.fetchRequestInit, ({ result: o }) => (n = n.replace(s, `url(${o})`), [s, o]));
  });
  return Promise.all(a).then(() => n);
}
function ci(e) {
  if (e == null)
    return [];
  const t = [], n = /(\/\*[\s\S]*?\*\/)/gi;
  let r = e.replace(n, "");
  const i = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  for (; ; ) {
    const o = i.exec(r);
    if (o === null)
      break;
    t.push(o[0]);
  }
  r = r.replace(i, "");
  const a = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, s = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", l = new RegExp(s, "gi");
  for (; ; ) {
    let o = a.exec(r);
    if (o === null) {
      if (o = l.exec(r), o === null)
        break;
      a.lastIndex = l.lastIndex;
    } else
      l.lastIndex = a.lastIndex;
    t.push(o[0]);
  }
  return t;
}
async function rm(e, t) {
  const n = [], r = [];
  return e.forEach((i) => {
    if ("cssRules" in i)
      try {
        ft(i.cssRules || []).forEach((a, s) => {
          if (a.type === CSSRule.IMPORT_RULE) {
            let l = s + 1;
            const o = a.href, d = oi(o).then((c) => li(c, t)).then((c) => ci(c).forEach((m) => {
              try {
                i.insertRule(m, m.startsWith("@import") ? l += 1 : i.cssRules.length);
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
      } catch (a) {
        const s = e.find((l) => l.href == null) || document.styleSheets[0];
        i.href != null && r.push(oi(i.href).then((l) => li(l, t)).then((l) => ci(l).forEach((o) => {
          s.insertRule(o, s.cssRules.length);
        })).catch((l) => {
          console.error("Error loading remote stylesheet", l);
        })), console.error("Error inlining remote css file", a);
      }
  }), Promise.all(r).then(() => (e.forEach((i) => {
    if ("cssRules" in i)
      try {
        ft(i.cssRules || []).forEach((a) => {
          n.push(a);
        });
      } catch (a) {
        console.error(`Error while reading CSS rules from ${i.href}`, a);
      }
  }), n));
}
function am(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => xs(t.style.getPropertyValue("src")));
}
async function im(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = ft(e.ownerDocument.styleSheets), r = await rm(n, t);
  return am(r);
}
function _s(e) {
  return e.trim().replace(/["']/g, "");
}
function sm(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((a) => {
      t.add(_s(a));
    }), Array.from(r.children).forEach((a) => {
      a instanceof HTMLElement && n(a);
    });
  }
  return n(e), t;
}
async function om(e, t) {
  const n = await im(e, t), r = sm(e);
  return (await Promise.all(n.filter((a) => r.has(_s(a.style.fontFamily))).map((a) => {
    const s = a.parentStyleSheet ? a.parentStyleSheet.href : null;
    return Ss(a.cssText, s, t);
  }))).join(`
`);
}
async function lm(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await om(e, t);
  if (n) {
    const r = document.createElement("style"), i = document.createTextNode(n);
    r.appendChild(i), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function Cs(e, t = {}) {
  const { width: n, height: r } = Es(e, t), i = await Gn(e, t, !0);
  return await lm(i, t), await ks(i, t), nm(i, t), await Cu(i, n, r);
}
async function Ts(e, t = {}) {
  const { width: n, height: r } = Es(e, t), i = await Cs(e, t), a = await Mn(i), s = document.createElement("canvas"), l = s.getContext("2d"), o = t.pixelRatio || Su(), d = t.canvasWidth || n, c = t.canvasHeight || r;
  return s.width = d * o, s.height = c * o, t.skipAutoScale || ku(s), s.style.width = `${d}`, s.style.height = `${c}`, t.backgroundColor && (l.fillStyle = t.backgroundColor, l.fillRect(0, 0, s.width, s.height)), l.drawImage(a, 0, 0, s.width, s.height), s;
}
async function cm(e, t = {}) {
  return (await Ts(e, t)).toDataURL();
}
const dm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: Ts,
  toPng: cm,
  toSvg: Cs
}, Symbol.toStringTag, { value: "Module" }));
