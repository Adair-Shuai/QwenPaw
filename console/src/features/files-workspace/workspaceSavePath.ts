/** Normalize a user-entered path so it can be written under the project root. */
export function sanitizeWorkspaceSavePath(raw: string): string | null {
  const normalized = raw.trim().replace(/\\/g, "/");
  if (
    !normalized ||
    normalized.includes("\0") ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:/.test(normalized)
  ) {
    return null;
  }
  const segments = normalized
    .split("/")
    .filter((segment) => segment && segment !== ".");
  if (segments.length === 0 || segments.some((segment) => segment === "..")) {
    return null;
  }

  const fileName = segments[segments.length - 1];
  if (!fileName.includes(".")) {
    segments[segments.length - 1] = `${fileName}.md`;
  }
  return segments.join("/");
}

export function isInlineGeneratedTab(tab?: {
  source?: string;
  artifactUrl?: string;
}): boolean {
  return tab?.source === "artifact" && !tab.artifactUrl;
}
