import type { FileTarget } from "./types";

export function isAbsoluteLocalFilePath(rawPath: string): boolean {
  const path = rawPath.trim();
  return (
    path.startsWith("file://") ||
    path.startsWith("/") ||
    /^[a-z]:[\\/]/i.test(path)
  );
}

function hasUnsafeSegment(path: string): boolean {
  return path
    .split("/")
    .some((segment) => !segment || segment === "." || segment === "..");
}

export function parseInternalFileLink(
  rawHref: string,
  allowAbsolutePaths = false,
  allowDirectoryPaths = false,
): FileTarget | null {
  const href = rawHref.trim();
  if (!href || href.startsWith("#") || href.includes("?")) {
    return null;
  }
  let [rawPath, fragment = ""] = href.split("#", 2);
  const suffix = /:(\d+)(?:-(\d+))?(?::(\d+))?$/.exec(rawPath);
  if (suffix) {
    if (fragment) return null;
    rawPath = rawPath.slice(0, suffix.index);
    fragment = `L${suffix[1]}${suffix[2] ? `-L${suffix[2]}` : ""}${
      suffix[3] ? `C${suffix[3]}` : ""
    }`;
  }
  const scheme = /^[a-z][a-z\d+.-]*:/i.exec(rawPath)?.[0].toLowerCase();
  if (scheme && !/^[a-z]:[\\/]/i.test(rawPath) && scheme !== "file:") {
    return null;
  }
  let path: string;
  try {
    if (scheme === "file:") {
      const url = new URL(rawPath);
      if (url.hostname && url.hostname !== "localhost") return null;
      rawPath = url.pathname.replace(/^\/([a-z]:\/)/i, "$1");
    }
    path = decodeURIComponent(rawPath).replace(/\\/g, "/");
  } catch {
    return null;
  }
  const absolute = isAbsoluteLocalFilePath(path);
  const segments = path.replace(/^(?:[a-z]:)?\//i, "");
  const directoryRoot = allowDirectoryPaths && absolute && !segments;
  const checkedSegments = allowDirectoryPaths
    ? segments.replace(/\/$/, "")
    : segments;
  if (
    !path ||
    /[\u0000-\u001f\u007f]/.test(path) ||
    path.startsWith("//") ||
    (absolute && !allowAbsolutePaths) ||
    (!absolute && /^[a-z]:/i.test(path)) ||
    (!directoryRoot && hasUnsafeSegment(checkedSegments))
  ) {
    return null;
  }

  const lineMatch = /^L(\d+)(?:-L?(\d+))?(?:C(\d+))?$/.exec(fragment);
  if (fragment && !lineMatch) return null;
  const line = lineMatch ? Number(lineMatch[1]) : undefined;
  const endLine = lineMatch?.[2] ? Number(lineMatch[2]) : undefined;
  const column = lineMatch?.[3] ? Number(lineMatch[3]) : undefined;
  if (
    [line, endLine, column].some(
      (value) =>
        value !== undefined && (!Number.isSafeInteger(value) || value < 1),
    ) ||
    (line !== undefined && endLine !== undefined && endLine < line)
  )
    return null;
  return {
    source: "workspace",
    path,
    line,
    ...(endLine !== undefined && { endLine }),
    column,
  };
}

export function toProjectRelativePath(
  rawPath: string,
  projectDirectory?: string,
): string | null {
  const path = rawPath.trim().replace(/\\/g, "/");
  // These are filesystem names. Preserve literal link punctuation and percent signs.
  const relativePath = (value: string) =>
    parseInternalFileLink(value.split("/").map(encodeURIComponent).join("/"))
      ?.path ?? null;
  const direct = relativePath(path);
  if (direct) return direct;
  if (!projectDirectory) return null;

  const root = projectDirectory.trim().replace(/\\/g, "/").replace(/\/+$/, "");
  const ignoreCase = /^[a-z]:\//i.test(root);
  const comparablePath = ignoreCase ? path.toLowerCase() : path;
  const comparableRoot = ignoreCase ? root.toLowerCase() : root;
  if (!comparablePath.startsWith(`${comparableRoot}/`)) return null;
  return relativePath(path.slice(root.length + 1));
}

function normalizeComparablePath(path: string): string {
  const normalized = path.trim().replace(/\\/g, "/").replace(/\/+$/, "");
  return /^[a-z]:\//i.test(normalized) ? normalized.toLowerCase() : normalized;
}

function isWithinDirectory(path: string, directory: string): boolean {
  const candidate = normalizeComparablePath(path);
  const root = normalizeComparablePath(directory);
  return candidate === root || candidate.startsWith(`${root}/`);
}

export function rootForFileReference(
  path: string,
  projectDirectory: string,
  workspaceDirectory: string,
): "project" | "workspace" {
  const normalized = path.trim().replace(/\\/g, "/");
  const absolute = normalized.startsWith("/") || /^[a-z]:\//i.test(normalized);
  if (!absolute || isWithinDirectory(normalized, projectDirectory)) {
    return "project";
  }
  return isWithinDirectory(normalized, workspaceDirectory)
    ? "workspace"
    : "project";
}

export function filePathFromPreviewUrl(
  rawUrl: string,
  fallbackPath?: string,
): string | null {
  const marker = "/files/preview/";
  const markerIndex = rawUrl.indexOf(marker);
  if (markerIndex < 0) return null;
  const encodedPath = rawUrl
    .slice(markerIndex + marker.length)
    .split(/[?#]/, 1)[0];
  if (!encodedPath) return null;
  try {
    const decoded = decodeURIComponent(encodedPath).replace(/\\/g, "/");
    if (/^[a-z]:\//i.test(decoded)) return decoded;
    if (/^%2f/i.test(encodedPath) || decoded.startsWith("/")) {
      return `/${decoded.replace(/^\/+/, "")}`;
    }
    if (fallbackPath && isAbsoluteLocalFilePath(fallbackPath)) {
      return fallbackPath.replace(/^file:\/\//, "").replace(/\\/g, "/");
    }
    return decoded;
  } catch {
    return null;
  }
}
