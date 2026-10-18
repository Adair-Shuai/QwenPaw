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
  zh: `### UGSci 桌面端更新

1. 打开 UGSci 桌面应用，点击版本号旁的更新按钮。
2. 如有可用更新，查看目标版本和更新内容，点击“现在更新”。
3. 按提示完成下载、安装与重启。重启后如有组件更新，请继续按提示完成。

若提示“当前已是最新版本”，无需更新。`,

  ru: `### Обновление UGSci для компьютера

1. Откройте настольное приложение UGSci и нажмите кнопку обновления рядом с номером версии.
2. Если доступно обновление, проверьте новую версию и список изменений, затем нажмите «Обновить сейчас».
3. Следуйте подсказкам для загрузки, установки и перезапуска. Если после перезапуска доступны обновления компонентов, следуйте дальнейшим подсказкам.

Если приложение сообщает, что установлена последняя версия, обновление не требуется.`,

  en: `### Updating UGSci Desktop

1. Open the UGSci desktop app and click the update button next to the version number.
2. If an update is available, review the target version and release notes, then click “Update now”.
3. Follow the prompts to download, install, and restart. If component updates are available after restarting, follow the remaining prompts.

If the app says “You're up to date”, no update is needed.`,
};
