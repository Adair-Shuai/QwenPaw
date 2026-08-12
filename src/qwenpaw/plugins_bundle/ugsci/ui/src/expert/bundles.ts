/**
 * Expert bundle definitions — pre-configured expert templates.
 *
 * Each bundle contains system prompt, recommended skills, and reserved
 * slots for knowledge files, MCP clients, and memory seeds.
 */

import { apiUrl, getHost } from "../core/runtime";

// ─── Expert Bundles ────────────────────────────────────────────────────────
//
// An Expert Bundle is a complete, distributable expert definition containing
// system prompt, recommended skills, and (future) knowledge files, MCP clients,
// and memory seeds.  See docs/expert-bundle-design.md for the full spec.

/** A knowledge file attached to an expert bundle (interface reserved). */
export interface KnowledgeFile {
  filename: string;
  content: string;
  enabled?: boolean;
  description?: string;
}

/** An MCP client configuration attached to an expert bundle (interface reserved). */
export interface MCPClientConfig {
  client_key: string;
  name: string;
  description: string;
  transport: "stdio" | "streamable_http" | "sse";
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  url?: string;
  headers?: Record<string, string>;
  tools?: string[] | null;
}

/** A memory seed attached to an expert bundle (interface reserved). */
export interface MemorySeed {
  type: "proactive" | "episodic";
  content: string;
  metadata?: Record<string, any>;
}

export interface ExpertBundle {
  // ── Metadata ──
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  author: string;
  tags: string[];

  // ── Avatar ──
  /** DiceBear seed (defaults to name if not set). */
  avatar_seed?: string;
  /** Custom avatar URL (data: or https:). Overrides avatar_seed. */
  avatar_url?: string;
  /** @deprecated kept for backward compat; use avatar_seed instead. */
  emoji?: string;

  // ── Prompt layer ──
  system_prompt: string;
  soul_prompt?: string;
  profile_prompt?: string;

  // ── Skill layer ──
  recommended_skills: string[];

  // ── Knowledge layer (reserved) ──
  knowledge_files?: KnowledgeFile[];

  // ── MCP layer (reserved) ──
  mcp_clients?: MCPClientConfig[];

  // ── Memory layer (reserved) ──
  memory_seeds?: MemorySeed[];

  // ── Behavior config ──
  approval_level: "AUTO" | "MANUAL";
  model_config?: { provider_id?: string; model?: string };
  welcome_message?: string;
}

/**
 * Backward-compatible alias.  Old code references `ExpertTemplate` and
 * snake_case fields — we keep them working via getters.
 */
export interface ExpertTemplate extends ExpertBundle {}

/** Helper: get the avatar URL for a bundle (avatar_url > avatar_seed > name). */
export function getBundleAvatarUrl(bundle: ExpertBundle): string {
  if (bundle.avatar_url) return bundle.avatar_url;
  const seed = bundle.avatar_seed || bundle.name;
  return apiUrl(`/ugsci/avatar/${encodeURIComponent(seed)}`);
}

/** Helper: render ExpertAvatar for a bundle. */
export function BundleAvatar({
  bundle,
  size = 32,
  borderRadius = "50%",
}: {
  bundle: ExpertBundle;
  size?: number;
  borderRadius?: string | number;
}) {
  const React = getHost().React;
  const [retry, setRetry] = React.useState(0);
  const baseUrl = getBundleAvatarUrl(bundle);
  const src = retry === 0 ? baseUrl : `${baseUrl}?_r=${retry}`;
  return React.createElement("img", {
    src,
    alt: bundle.name,
    onError: () => { if (retry < 1) setRetry(retry + 1); },
    style: { width: size, height: size, borderRadius, objectFit: "cover", flexShrink: 0 },
  });
}

export const EXPERT_BUNDLES: ExpertBundle[] = [
  {
    id: "reservoir-engineer",
    name: "油藏工程师",
    category: "油气开发",
    description:
      "**油藏工程师** —— 擅长储量评估、物质平衡计算、递减曲线分析、油藏数值模拟方案设计。",
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
      "sensitivity-analysis",
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO",
  },
  {
    id: "drilling-engineer",
    name: "钻井工程师",
    category: "钻完井",
    description:
      "**钻井工程师** —— 擅长井身结构设计、钻井液优化、套管设计、固井方案和钻井风险管理。",
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
      "systematic-debugging",
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "MANUAL",
  },
  {
    id: "well-logging-analyst",
    name: "测井分析师",
    category: "测井试油",
    description:
      "**测井分析师** —— 擅长测井曲线解释、岩性识别、孔隙度/饱和度计算和储层评价。",
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
      "scikit-learn",
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO",
  },
  {
    id: "production-engineer",
    name: "采油工程师",
    category: "油气生产",
    description:
      "**采油工程师** —— 擅长举升工艺设计、注水管理、增产措施工艺设计和生产动态监测。",
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
      "multi-objective-optimization",
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO",
  },
  {
    id: "geophysicist",
    name: "地球物理专家",
    category: "地球物理",
    description:
      "**地球物理专家** —— 擅长地震资料解释、属性分析、反演处理和储层预测。",
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
      "scikit-learn",
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO",
  },
  {
    id: "pvt-analyst",
    name: "PVT 分析师",
    category: "流体性质",
    description:
      "**PVT 分析师** —— 擅长油气流体物性计算、相态分析、PVT 实验拟合和组分模型。",
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
      "pymoo",
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO",
  },
];

/** Backward-compatible alias so existing code using EXPERT_TEMPLATES keeps working. */
export const EXPERT_TEMPLATES = EXPERT_BUNDLES;
