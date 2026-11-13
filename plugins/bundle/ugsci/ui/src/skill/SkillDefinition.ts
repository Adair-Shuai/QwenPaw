import { getHost, apiFetch } from "../core/runtime";
import { renderMarkdown } from "../core/shared";

/** Full definition, fetched only while the selected skill detail is mounted. */
export function SkillDefinition({
  content,
  name,
  agentId,
  poolName,
}: {
  content?: string;
  name?: string;
  agentId?: string;
  poolName?: string;
}) {
  const React = getHost().React;
  const { Button, Spin, Alert, Tabs } = getHost().antd;
  const [definition, setDefinition] = React.useState(content || "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [retry, setRetry] = React.useState(0);
  React.useEffect(() => {
    let cancelled = false;
    setDefinition(content || "");
    setError("");
    setLoading(false);
    if (content || (!poolName && (!name || !agentId))) return;
    setLoading(true);
    apiFetch<{ content: string }>(
      poolName
        ? `/skills/pool/${encodeURIComponent(poolName)}/content`
        : `/skills/${encodeURIComponent(name!)}`,
      {
        headers: agentId ? { "X-Agent-Id": agentId } : undefined,
        bypassCache: retry > 0,
      },
    )
      .then((result) => {
        if (!cancelled) setDefinition(result.content || "");
      })
      .catch((reason) => {
        if (!cancelled) setError(reason.message || "加载技能定义失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [content, name, agentId, poolName, retry]);
  return React.createElement(
    "section",
    { className: "ugsci-skill-definition", "aria-label": "技能全文定义" },
    React.createElement("h3", null, "技能定义"),
    loading
      ? React.createElement(Spin, { tip: "加载技能定义" })
      : error
      ? React.createElement(Alert, {
          type: "error",
          message: error,
          action: React.createElement(
            Button,
            { onClick: () => setRetry((value) => value + 1) },
            "重试",
          ),
        })
      : !definition
      ? React.createElement("p", null, "暂无技能定义")
      : React.createElement(Tabs, {
          items: [
            {
              key: "preview",
              label: "阅读",
              children: React.createElement(
                "article",
                { className: "ugsci-skill-markdown" },
                renderMarkdown(
                  definition.replace(
                    /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,
                    "",
                  ),
                  React,
                ),
              ),
            },
            {
              key: "source",
              label: "SKILL.md 源文",
              children: React.createElement(
                "pre",
                { className: "ugsci-skill-source" },
                definition,
              ),
            },
          ],
        }),
  );
}
