export type WorkspaceMarkdownTarget =
  | { kind: "external"; href: string }
  | { kind: "anchor"; href: string }
  | { kind: "workspace"; path: string }
  | { kind: "invalid" };

const URI_SCHEME = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

/**
 * Resolve a Markdown URL against the Markdown file rather than the browser
 * route. Workspace paths are always normalized to a root-relative form.
 */
export function resolveWorkspaceMarkdownTarget(
  href: string,
  markdownPath: string,
): WorkspaceMarkdownTarget {
  const value = href.trim();
  if (!value || value.includes("\0")) return { kind: "invalid" };
  if (value.startsWith("#")) return { kind: "anchor", href: value };
  if (value.startsWith("//") || URI_SCHEME.test(value)) {
    return { kind: "external", href: value };
  }

  const pathOnly = value.split(/[?#]/, 1)[0].replace(/\\/g, "/");
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(pathOnly);
  } catch {
    return { kind: "invalid" };
  }

  const normalizedMarkdownPath = markdownPath.replace(/\\/g, "/");
  const baseParts = normalizedMarkdownPath
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean);
  baseParts.pop();

  const parts = decodedPath.startsWith("/") ? [] : baseParts;
  for (const part of decodedPath.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (parts.length === 0) return { kind: "invalid" };
      parts.pop();
      continue;
    }
    parts.push(part);
  }

  if (parts.length === 0) return { kind: "invalid" };
  return { kind: "workspace", path: parts.join("/") };
}
