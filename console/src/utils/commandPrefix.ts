export const LOCALIZED_COMMAND_PREFIX = "、";

/** Treat the Chinese dunhao as a keyboard-friendly slash-command prefix. */
export function normalizeCommandPrefix(text: string): string {
  if (!text.startsWith(LOCALIZED_COMMAND_PREFIX)) return text;
  return `/${text.slice(LOCALIZED_COMMAND_PREFIX.length)}`;
}

export function isCommandInput(text: string): boolean {
  return text.startsWith("/") || text.startsWith(LOCALIZED_COMMAND_PREFIX);
}
