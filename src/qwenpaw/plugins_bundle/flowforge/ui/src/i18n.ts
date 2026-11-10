import { workflowEnglish } from "./english";

export type WorkflowLocale = "zh" | "en";
export type TranslationValues = Record<string, string | number>;
export type WorkflowTranslate = (
  source: string,
  englishOrValues?: string | TranslationValues,
  values?: TranslationValues,
) => string;

/** UI resources are separate from saved field names and user-authored values. */
export { workflowEnglish } from "./english";

export function workflowLocale(language?: string | null): WorkflowLocale {
  if (typeof language === "string" && language)
    return language.toLowerCase().startsWith("zh") ? "zh" : "en";
  try {
    const preference = window.localStorage.getItem("language");
    if (preference) return workflowLocale(preference);
  } catch {
    // Embedded clients can disable local storage.
  }
  return "zh";
}

export function translateWorkflow(
  source: string,
  locale: string = workflowLocale(),
  englishOrValues?: string | TranslationValues,
  values?: TranslationValues,
): string {
  const original = source ?? "";
  const english =
    typeof englishOrValues === "string" ? englishOrValues : undefined;
  const replacements =
    typeof englishOrValues === "object" ? englishOrValues : values;
  const text =
    workflowLocale(locale) === "zh"
      ? original
      : english ?? workflowEnglish[original] ?? original;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    replacements && Object.prototype.hasOwnProperty.call(replacements, key)
      ? String(replacements[key])
      : match,
  );
}

/** The public host hook subscribes to live Console language changes. */
export function useWorkflowI18n(): {
  t: WorkflowTranslate;
  locale: WorkflowLocale;
} {
  const host =
    typeof window === "undefined" ? undefined : (window as any).QwenPaw?.host;
  const hostLanguage = host?.useLocale?.();
  const locale = workflowLocale(hostLanguage);
  const t: WorkflowTranslate = (source, englishOrValues, values) =>
    translateWorkflow(source, locale, englishOrValues, values);
  return { t, locale };
}

export const translate = translateWorkflow;
