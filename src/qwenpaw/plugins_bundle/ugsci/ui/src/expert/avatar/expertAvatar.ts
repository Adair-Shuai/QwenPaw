import { avatarKit } from "./avatarArtwork";
import type { ExpertData } from "../../core/types";

export const AVATAR_COLOR_PARTS = [
  { id: "shell", label: "外壳", fallback: "#171717" },
  { id: "visor", label: "面罩", fallback: "#171717" },
  { id: "eyes", label: "眼睛", fallback: "#ffffff", transparent: true },
  { id: "crown", label: "头饰", fallback: "#171717" },
  { id: "badge", label: "徽记", fallback: "#171717" },
  { id: "badge_ring", label: "徽记边框", fallback: "#171717" },
  { id: "background", label: "背景", fallback: "#f3f0e8", transparent: true },
] as const;

export type ExpertAvatarColors = Partial<
  Record<(typeof AVATAR_COLOR_PARTS)[number]["id"], string>
>;

export interface ExpertAvatarRecipe {
  domain: string;
  role: string;
  shell: "auto" | "round" | "faceted" | "shield" | "industrial";
  visor: "classic" | "soft" | "angular";
  expression: "focused" | "friendly" | "thinking";
  badge: string;
  crown_domain: string;
  crown_role: string;
  category_label: string;
  colors?: ExpertAvatarColors | null;
}

// Prefer specific identities before broader domain vocabulary in descriptions.
const ROLE_KEYWORDS: [string, string, RegExp][] = [
  ["storage", "cycling", /注采|配注|采气|生产动态|库井动态|气年度/i],
  ["storage", "seal", /动态密封|盖层|封闭性|密封性/i],
  [
    "storage",
    "capacity",
    /储气|库容|库存评价|地下储库|underground gas storage/i,
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
  ["software", "development", /软件|开发|编程|代码|coding|developer/i],
];

const DOMAIN_KEYWORDS: [string, RegExp][] = [
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
  ["aerospace", /航空|航天|飞机|卫星|推进|aerospace|aircraft/i],
];

const ROLE_IDENTITIES = avatarKit.domains.flatMap((domain) =>
  domain.roles.map((role) => ({
    domain: domain.id,
    role: role.id,
    label: role.label.replace(/专家$/, ""),
  })),
);

export function matchExpertAvatar(
  name: string,
  description = "",
): ExpertAvatarRecipe {
  let selected: { domain: string; role: string } | undefined;
  for (const source of [name, description.split(/\s+\|\s+/)[0]]) {
    const exact = ROLE_IDENTITIES.find(({ label }) => source.includes(label));
    if (exact) {
      selected = { domain: exact.domain, role: exact.role };
      break;
    }
    const keyword = ROLE_KEYWORDS.find(([, , pattern]) => pattern.test(source));
    if (keyword) {
      selected = { domain: keyword[0], role: keyword[1] };
      break;
    }
    const domainKeyword = DOMAIN_KEYWORDS.find(([, pattern]) =>
      pattern.test(source),
    );
    const domain = avatarKit.domains.find(
      (item) => item.id === domainKeyword?.[0] || source.includes(item.label),
    );
    if (domain) {
      selected = { domain: domain.id, role: domain.roles[0].id };
      break;
    }
  }
  return {
    domain: selected?.domain || "office",
    role: selected?.role || "document",
    shell: "auto",
    visor: "classic",
    expression: "focused",
    badge: "none",
    crown_domain: "auto",
    crown_role: "auto",
    category_label: "",
  };
}

export function avatarForExpert(expert: ExpertData): ExpertAvatarRecipe {
  return (
    expert.presentation?.avatar ||
    matchExpertAvatar(
      expert.presentation?.display_name || expert.agent.name,
      [
        expert.agent.name,
        expert.presentation?.specialty,
        expert.presentation?.summary,
        expert.config?.description,
        expert.agent.description,
      ]
        .filter(Boolean)
        .join(" "),
    )
  );
}

// Keep only recent SVG templates. The budget counts UTF-16 key and markup text,
// with an entry limit also bounding Map overhead. Recipes remain the persisted source.
const SVG_CACHE_LIMIT = 64;
const SVG_CACHE_TEXT_BYTES = 128 * 1024;
const TEMPLATE_CLIP_ID = "ugsci-avatar-template";
const svgCache = new Map<string, string>();
let cachedTextBytes = 0;
let avatarInstance = 0;

export function renderExpertAvatar(
  recipe: ExpertAvatarRecipe,
  name: string,
  size: number,
  instanceId?: string,
): string {
  const key = JSON.stringify([
    recipe.domain,
    recipe.role,
    recipe.shell,
    recipe.visor,
    recipe.expression,
    recipe.badge,
    recipe.crown_domain,
    recipe.crown_role,
    recipe.category_label,
    ...AVATAR_COLOR_PARTS.map(({ id }) => recipe.colors?.[id] || null),
    name,
    size,
  ]);
  let svg = svgCache.get(key);
  if (svg !== undefined) {
    svgCache.delete(key);
    svgCache.set(key, svg);
  } else {
    svg = avatarKit.render({
      ...recipe,
      crownDomain: recipe.crown_domain,
      crownRole: recipe.crown_role,
      categoryLabel: recipe.category_label,
      name,
      size,
      clipId: TEMPLATE_CLIP_ID,
      polarity: "light",
      background: "transparent",
      foreground: "currentColor",
    });
    const bytes = (key.length + svg.length) * 2;
    if (bytes <= SVG_CACHE_TEXT_BYTES) {
      while (
        svgCache.size >= SVG_CACHE_LIMIT ||
        cachedTextBytes + bytes > SVG_CACHE_TEXT_BYTES
      ) {
        const oldest = svgCache.keys().next().value!;
        cachedTextBytes -= (oldest.length + svgCache.get(oldest)!.length) * 2;
        svgCache.delete(oldest);
      }
      svgCache.set(key, svg);
      cachedTextBytes += bytes;
    }
  }
  // Stable per mounted avatar, unique between instances sharing the same template.
  const suffix =
    instanceId === undefined
      ? "generated-" + (++avatarInstance).toString(36)
      : "instance-" +
        instanceId.replace(
          /[^a-zA-Z0-9-]/g,
          (character) => "_" + character.charCodeAt(0).toString(16) + "_",
        );
  const clipId = "ugsci-avatar-" + suffix;
  return svg
    .replace('id="' + TEMPLATE_CLIP_ID + '"', 'id="' + clipId + '"')
    .replace(
      'clip-path="url(#' + TEMPLATE_CLIP_ID + ')"',
      'clip-path="url(#' + clipId + ')"',
    );
}
