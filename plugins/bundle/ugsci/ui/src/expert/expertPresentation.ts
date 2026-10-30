import type { ExpertData, ExpertPresentation } from "../core/types";
import { apiFetch } from "../core/runtime";
import { EXPERT_BUNDLES } from "./bundles";

export const EXPERT_CATEGORIES = [
  "全部专家",
  "油气工程",
  "数据与研究",
  "通用助手",
  "应用专家",
] as const;

export function fetchExpertPresentation(id: string) {
  return apiFetch<ExpertPresentation>(
    `/ugsci/experts/${encodeURIComponent(id)}/presentation`,
    { headers: { "X-Agent-Id": id } },
  );
}

export function saveExpertPresentation(id: string, value: ExpertPresentation) {
  return apiFetch<ExpertPresentation>(
    `/ugsci/experts/${encodeURIComponent(id)}/presentation`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": id },
      body: JSON.stringify(value),
    },
  );
}

// Display summaries only. Never rewrite PROFILE.md or other role instructions.
export function conciseDescription(value: string): string {
  const clean = (text: string) =>
    text
      .replace(/\*\*|`|^#+\s*/gm, "")
      .replace(/^\s*[-*•]\s*/gm, "")
      .replace(/\s+/g, " ")
      .replace(/\s*[-•|]+\s*$/, "")
      .trim();
  const first = value.split(/\s+\|\s+|\n/)[0]?.trim() || "";
  const identity =
    /(?:定位|职责)[：:]\s*([\s\S]*?)(?=\s*(?:[-•]\s*)?(?:风格|Agent ID|上游|输出)[：:]|$)/i.exec(
      value,
    );
  let text = clean(first);
  if (!text || /^(?:名字|Agent ID)[：:]|^Default QwenPaw agent/i.test(text))
    text = clean(identity?.[1] || "");
  if (/挑个你喜欢|机器里的幽灵|AI？机器人/.test(text)) text = "";
  return text.length > 110
    ? `${text.slice(0, 109).replace(/[，、；：\s]+$/, "")}…`
    : text;
}

export function expertPresentation(expert: ExpertData) {
  const { agent, presentation } = expert;
  const bundle = EXPERT_BUNDLES.find(
    (b) => b.id === agent.id || b.name === agent.name,
  );
  const source = `${agent.name} ${bundle?.category || ""} ${
    agent.description || ""
  }`;
  const automaticCategory = agent.managed_by_app
    ? "应用专家"
    : /资料审核|数据诊断|数值模拟分析|数据分析|科研|研究方法/.test(source)
    ? "数据与研究"
    : /油气|储气|气藏|油藏|地质|钻井|钻完井|物性|PVT|库存|注采|采油|测井|储层/i.test(
        source,
      )
    ? "油气工程"
    : "通用助手";
  const category = agent.managed_by_app
    ? "应用专家"
    : presentation?.category || automaticCategory;
  const summary =
    presentation?.summary ||
    conciseDescription(expert.config?.description || agent.description || "") ||
    (agent.id === "default"
      ? "处理日常问答、信息整理和电脑操作任务。"
      : "尚未填写简介，可在设置中补充职责说明。");
  const skills = expert.skills.filter((s) => s.enabled !== false);
  const tags = [
    ...new Set(
      bundle?.tags?.length ? bundle.tags : skills.flatMap((s) => s.tags || []),
    ),
  ].slice(0, 2);
  return {
    name: presentation?.display_name || agent.name,
    specialty: agent.managed_by_app
      ? "应用专属专家"
      : presentation?.specialty || bundle?.category || category,
    category,
    summary,
    tags,
  };
}
