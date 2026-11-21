export const DEFAULT_UI_LANGUAGE = "zh";

export function readUiLanguage(): string {
  try {
    return localStorage.getItem("language") || DEFAULT_UI_LANGUAGE;
  } catch {
    return DEFAULT_UI_LANGUAGE;
  }
}
