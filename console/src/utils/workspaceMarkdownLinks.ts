export type WorkspaceMarkdownTarget =
  | { kind: "external"; href: string }
  | { kind: "anchor"; href: string }
  | { kind: "workspace"; path: string }
  | { kind: "invalid" };

const URI_SCHEME = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const WINDOWS_ABSOLUTE_PATH = /^([a-zA-Z]):[\\/]/;

/**
 * Resolve a Markdown URL against the Markdown file rather than the browser
 * route. Relative workspace paths stay root-relative, while resources beside
 * an absolute Markdown file retain their filesystem-absolute base.
 */
export function resolveWorkspaceMarkdownTarget(
  href: string,
  markdownPath: string,
): WorkspaceMarkdownTarget {
  const value = href.trim();
  if (!value || value.includes("\0")) return { kind: "invalid" };
  if (value.startsWith("#")) return { kind: "anchor", href: value };
  if (
    !WINDOWS_ABSOLUTE_PATH.test(value) &&
    (value.startsWith("//") || URI_SCHEME.test(value))
  ) {
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
  const markdownDrive = /^([a-zA-Z]):\//.exec(normalizedMarkdownPath)?.[1];
  const hrefDrive = /^([a-zA-Z]):\//.exec(decodedPath)?.[1];
  const markdownIsAbsolute =
    normalizedMarkdownPath.startsWith("/") || Boolean(markdownDrive);
  const hrefIsWorkspaceRoot = decodedPath.startsWith("/");

  let prefix = "";
  let basePath = normalizedMarkdownPath;
  if (hrefDrive) {
    prefix = `${hrefDrive}:/`;
    basePath = "";
    decodedPath = decodedPath.slice(3);
  } else if (!hrefIsWorkspaceRoot && markdownDrive) {
    prefix = `${markdownDrive}:/`;
    basePath = normalizedMarkdownPath.slice(3);
  } else if (!hrefIsWorkspaceRoot && markdownIsAbsolute) {
    prefix = "/";
    basePath = normalizedMarkdownPath.replace(/^\/+/, "");
  }

  const baseParts = basePath.split("/").filter(Boolean);
  baseParts.pop();

  const parts = hrefIsWorkspaceRoot || hrefDrive ? [] : baseParts;
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
  return { kind: "workspace", path: `${prefix}${parts.join("/")}` };
}
