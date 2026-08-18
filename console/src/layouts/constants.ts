// ── URLs ──────────────────────────────────────────────────────────────────

export { DESKTOP_UPDATE_MANIFEST_URL } from "../distribution";

export const GITHUB_URL = "https://github.com/agentscope-ai/QwenPaw" as const; // 上游仓库地址，换标后保留以跟踪上游更新

// ── Timing ────────────────────────────────────────────────────────────────

// ── URL helpers ───────────────────────────────────────────────────────────

export const getWebsiteLang = (lang: string): string =>
  lang.startsWith("zh") ? "zh" : "en";

export const getDocsUrl = (lang: string): string =>
  `/api/ugsci/docs/?lang=${getWebsiteLang(lang)}`;

export const getFaqUrl = (lang: string): string =>
  `https://qwenpaw.agentscope.io/docs/faq?lang=${getWebsiteLang(lang)}`;

export const getReleaseNotesUrl = (lang: string): string =>
  `https://qwenpaw.agentscope.io/release-notes?lang=${getWebsiteLang(lang)}`;

export const getFeatureDemosUrl = (lang: string): string =>
  `https://qwenpaw.agentscope.io/docs/functiondemo?lang=${getWebsiteLang(
    lang,
  )}`;

// ── Version helpers ────────────────────────────────────────────────────────

// Filter out pre-release versions; post-releases are treated as stable.
// PEP 440 pre-release suffixes: aN / bN / rcN (or cN) / devN.
export const isStableVersion = (v: string): boolean =>
  !/(\d)(?:[-.]?)(a|alpha|b|beta|rc|c|dev)[.-]?\d*/i.test(v);

// Compare two PEP 440 version strings. Returns >0 if a>b, <0 if a<b, 0 if equal.
// .postN releases sort after their base version (e.g. 1.0.0.post1 > 1.0.0).
// Pre-release versions (aN, bN, rcN) sort before their base version.
export const compareVersions = (a: string, b: string): number => {
  const normalise = (v: string): number[] => {
    // Handle .postN suffix
    const postMatch = v.match(/\.post(\d+)$/i);
    const postNum = postMatch ? Number(postMatch[1]) : 0;
    const baseVersion = v
      .replace(/\.post\d+$/i, "")
      .replace(/[-.]?(alpha|beta|rc)[.-]?(\d+)$/i, (_match, label, num) => {
        const short =
          label.toLowerCase() === "alpha"
            ? "a"
            : label.toLowerCase() === "beta"
            ? "b"
            : "rc";
        return `${short}${num}`;
      });

    // Handle pre-release suffix (e.g., 1.0.1b1 -> base=1.0.1, preType=b, preNum=1)
    const preMatch = baseVersion.match(/^(.+?)(a|alpha|b|beta|rc|c)(\d*)$/i);
    let coreVersion = baseVersion;
    let preType = 0; // 0 = stable, -3 = alpha, -2 = beta, -1 = rc
    let preNum = 0;
    if (preMatch) {
      coreVersion = preMatch[1];
      const preLabel = preMatch[2].toLowerCase();
      preType =
        preLabel === "a" || preLabel === "alpha"
          ? -3
          : preLabel === "b" || preLabel === "beta"
          ? -2
          : -1; // rc or c
      preNum = preMatch[3] ? Number(preMatch[3]) : 0;
    }

    const parts = coreVersion.split(/[.-]/).map((seg) => Number(seg) || 0);
    // Append: preType (0 for stable, negative for pre-release), preNum, postNum
    return [...parts, preType, preNum, postNum];
  };

  const aN = normalise(a);
  const bN = normalise(b);
  const len = Math.max(aN.length, bN.length);
  for (let i = 0; i < len; i++) {
    const diff = (aN[i] ?? 0) - (bN[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

// ── Update markdown ───────────────────────────────────────────────────────
export const UPDATE_MD: Record<string, string> = {
  zh: `### UGSci如何更新

请按安装方式选择，不要从公共 PyPI 安装名为 qwenpaw 的上游包。

1. 桌面端：点击标题栏版本号旁的更新按钮，按提示安装。

2. 源码安装：拉取本仓库最新代码后重新构建控制台并安装。

\`\`\`
git pull
cd console && npm ci && npm run build
cd .. && pip install -e .
\`\`\`

3. pip 安装：只有在已配置自建索引时才能用 CLI 升级。

\`\`\`
set QWENPAW_PYPI_JSON_URL=https://your-index.example/ugsci/json
set QWENPAW_PIP_INDEX_URL=https://your-index.example/simple
qwenpaw update
\`\`\`

未配置自建索引时，\`qwenpaw update\` 会拒绝执行，以免覆盖成上游 QwenPaw。`,

  ru: `### Как обновить UGSci

Выберите способ по типу установки. Не устанавливайте пакет qwenpaw с публичного PyPI.

1. Десктоп: кнопка обновления рядом с номером версии.

2. Из исходников: git pull, затем пересоберите console и pip install -e .

3. pip: только после настройки своего индекса (QWENPAW_PYPI_JSON_URL и QWENPAW_PIP_INDEX_URL). Без них qwenpaw update будет отказано.`,

  en: `### How to update UGSci

Use the method that matches how you installed UGSci. Do not install the public PyPI package named qwenpaw -- that is upstream QwenPaw.

1. Desktop: use the update button next to the version number.

2. Source install: pull this repository, rebuild the console, then pip install -e .

3. pip install: only after you point CLI at a self-hosted index.

\`\`\`
set QWENPAW_PYPI_JSON_URL=https://your-index.example/ugsci/json
set QWENPAW_PIP_INDEX_URL=https://your-index.example/simple
qwenpaw update
\`\`\`

Without those variables, \`qwenpaw update\` refuses so it cannot overwrite this fork.`,
};
