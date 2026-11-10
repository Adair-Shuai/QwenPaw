import { fromMarkdown } from "mdast-util-from-markdown";
import {
  isAbsoluteLocalFilePath,
  parseInternalFileLink,
} from "../../features/files-workspace/internalFileLinks";
import { mimeFromExtension } from "../../utils/mimeForPreview";

export const FILE_REFERENCE_HREF_PREFIX = "./.qwenpaw-file-reference/";
export const DIRECTORY_REFERENCE_HREF_PREFIX =
  "./.qwenpaw-directory-reference/";

interface MarkdownNode {
  type: string;
  url?: string;
  value?: string;
  position?: { start: { offset?: number }; end: { offset?: number } };
  children?: MarkdownNode[];
}

// Consume URLs and email addresses as complete tokens before looking for files.
const LINE_SUFFIX = String.raw`(?:#L\d+(?:-L?\d+)?(?:C\d+)?|:\d+(?:-\d+)?(?::\d+)?)?`;
const PATH_SEGMENT = String.raw`[\p{L}\p{N}_.%+~-]+`;
const POSIX_PATH_BOUNDARY = /[\s(\[{"'“‘（【：:，,。；;！？!?、]/u;
const TEXT_FILE_PATTERN = new RegExp(
  [
    String.raw`(?:https?:\/\/|file:\/\/|mailto:|www\.)[^\s<>"“”'，。；！？]+`,
    String.raw`(?<![\w.+-])[\w.+-]+@[\w.-]+`,
    String.raw`[“"‘']([^“”"‘’'\r\n]+)[”"’']`,
    String.raw`(?<![\w@:/\\.%+~-])(?:[a-z]:[\\/]|/)(?:${PATH_SEGMENT}[\\/])*${PATH_SEGMENT}[\\/]?${LINE_SUFFIX}`,
    String.raw`(?<![\w@:/\\.%+~-])(?:\./)?(?:${PATH_SEGMENT}/)+(?![\p{L}\p{N}_./\\%+~-])`,
    String.raw`(?<![\w@:/\\.%+~-])(?:[a-z]:[\\/]|\./|/)?(?:[\w.%+~-]+[\\/])*[\w.%+~-]+\.[a-z\d]+${LINE_SUFFIX}`,
  ].join("|"),
  "giu",
);
const COMMAND_PREFIX =
  /^(?:python[\d.]*|node|npm|npx|pnpm|yarn|uv|pip\d*|git|cd|cat|type|ls|dir|rg|grep|curl|wget|Get-Content|Set-Content|dotnet|cargo|go|bash|sh|powershell|pwsh)\s/i;

function normalizeReferenceText(value: string): string | null {
  const text = value.trim();
  if (!text || /^www\./i.test(text) || /[\r\n<>|;={}@`]/.test(text))
    return null;
  if (COMMAND_PREFIX.test(text)) return null;
  return text.replace(/\\/g, "/");
}

/** Recognize a complete filename, keeping ordinary code and identifiers literal. */
export function fileReferenceFromText(value: string): string | null {
  const normalized = normalizeReferenceText(value);
  if (!normalized) return null;
  const target = parseInternalFileLink(
    normalized.replace(/^\.\/(?=[^/])/, ""),
    true,
  );
  if (!target || !mimeFromExtension(target.path)) return null;
  return normalized;
}

/** Absolute locations and trailing slashes can be opened in the file manager. */
export function directoryReferenceFromText(value: string): string | null {
  const normalized = normalizeReferenceText(value);
  if (!normalized) return null;
  const target = parseInternalFileLink(
    normalized.replace(/^\.\/(?=[^/])/, ""),
    true,
    true,
  );
  if (!target || target.line) return null;
  if (
    !normalized.endsWith("/") &&
    (!isAbsoluteLocalFilePath(target.path) || mimeFromExtension(target.path))
  )
    return null;
  return normalized;
}

function referenceMarkdown(value: string): string | null {
  const directory = directoryReferenceFromText(value);
  const href = directory ?? fileReferenceFromText(value);
  if (!href) return null;
  const prefix = directory
    ? DIRECTORY_REFERENCE_HREF_PREFIX
    : FILE_REFERENCE_HREF_PREFIX;
  const label = value.replace(/([\\[\]])/g, "\\$1");
  return `[${label}](${prefix}${encodeURIComponent(href)})`;
}

function lastInlineCharacter(node: MarkdownNode): string | undefined {
  if (node.type === "break") return "\n";
  if (node.value) return node.value.slice(-1);
  const lastChild = node.children && node.children[node.children.length - 1];
  return lastChild && lastInlineCharacter(lastChild);
}

/** Decorate file mentions and protect local URI destinations from SDK filtering. */
export function prepareFileReferenceMarkdown(content: string): string {
  if (!/(?:\.[a-z][a-z\d]*|[a-z]:[\\/]|file:\/\/|\/)/i.test(content))
    return content;
  const nodes: Array<{ node: MarkdownNode; previous?: string }> = [
    { node: fromMarkdown(content) },
  ];
  const edits: Array<{ start: number; end: number; replacement: string }> = [];
  while (nodes.length) {
    const { node, previous: previousInlineCharacter } = nodes.pop()!;
    // Link labels, image descriptions and fenced code keep their own semantics.
    if (node.type === "image" || node.type === "code" || node.type === "html")
      continue;
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (
      node.type === "inlineCode" &&
      start !== undefined &&
      end !== undefined
    ) {
      const replacement = referenceMarkdown(node.value ?? "");
      if (replacement)
        edits.push({
          start,
          end,
          replacement,
        });
      continue;
    }
    if (node.type === "text" && start !== undefined && end !== undefined) {
      const raw = content.slice(start, end);
      for (const match of raw.matchAll(TEXT_FILE_PATTERN)) {
        const name = match[1] ?? match[0];
        const replacement = referenceMarkdown(name);
        if (!replacement) continue;
        // A match inside a larger identifier or URL is not a standalone file.
        const nameStart = (match.index ?? 0) + (match[1] ? 1 : 0);
        const previous = raw[nameStart - 1] ?? previousInlineCharacter;
        if (
          name.startsWith("/") &&
          previous !== undefined &&
          !POSIX_PATH_BOUNDARY.test(previous)
        )
          continue;
        if (previous && /[\w@:/\\.]/.test(previous)) continue;
        edits.push({
          start: start + nameStart,
          end: start + nameStart + name.length,
          replacement,
        });
      }
      continue;
    }
    if (
      node.type !== "link" &&
      node.type !== "linkReference" &&
      node.children
    ) {
      // Formatting marks do not separate words. Block boundaries do.
      let previous = ["paragraph", "heading", "tableCell"].includes(node.type)
        ? undefined
        : previousInlineCharacter;
      for (const child of node.children) {
        nodes.push({ node: child, previous });
        previous = lastInlineCharacter(child) ?? previous;
      }
    }
    const directory =
      node.url &&
      /[\\/]$/.test(node.url) &&
      directoryReferenceFromText(node.url);
    if (
      (node.type !== "link" && node.type !== "definition") ||
      !node.url ||
      (!directory &&
        (!/^(?:[a-z]:[\\/]|file:)/i.test(node.url) ||
          !parseInternalFileLink(node.url, true)))
    )
      continue;
    if (start === undefined || end === undefined) continue;
    const raw = content.slice(start, end);
    const delimiter = node.type === "link" ? "](" : "]:";
    const destination = raw.indexOf(node.url, raw.lastIndexOf(delimiter) + 2);
    if (destination < 0) continue;
    edits.push({
      start: start + destination,
      end: start + destination + node.url.length,
      replacement:
        (directory
          ? DIRECTORY_REFERENCE_HREF_PREFIX
          : FILE_REFERENCE_HREF_PREFIX) + encodeURIComponent(node.url),
    });
  }
  // Assemble once from the original offsets. Rebuilding the entire growing
  // document for every reference makes file-heavy answers quadratic.
  if (!edits.length) return content;
  const parts: string[] = [];
  let offset = 0;
  for (const edit of edits.sort((a, b) => a.start - b.start)) {
    parts.push(content.slice(offset, edit.start), edit.replacement);
    offset = edit.end;
  }
  parts.push(content.slice(offset));
  return parts.join("");
}
