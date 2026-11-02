import { buildWorkspaceScopeHeaders } from "../api/authHeaders";
import { chatApi } from "../api/modules/chat";
import { turnFilesApi } from "../api/modules/turnFiles";
import { workspaceApi } from "../api/modules/workspace";
import type { WorkspaceArtifact } from "../components/Workspace/types";
import { isAbsoluteLocalFilePath } from "../features/files-workspace/internalFileLinks";
import { mimeFromExtension } from "./mimeForPreview";
import { resolveWorkspaceMarkdownTarget } from "./workspaceMarkdownLinks";

export interface HtmlPreviewResources {
  content: string;
  missing: string[];
}

/** Resolve local presentation assets before entering the opaque iframe.
 * Credentials stay in the host; archived pages never use current workspace bytes.
 * This is a static document preview, not a module server or a build tool.
 */
export async function prepareHtmlPreviewResources(
  content: string,
  artifact: WorkspaceArtifact,
  signal?: AbortSignal,
): Promise<HtmlPreviewResources> {
  if (!artifact.workspacePath || !content) return { content, missing: [] };
  const doc = new DOMParser().parseFromString(content, "text/html");
  // An author-provided base owns URL resolution (e.g. an external CDN).
  if (doc.querySelector("base[href]")) return { content, missing: [] };
  const missing = new Set<string>();
  const cache = new Map<string, Promise<string>>();
  const archive = artifact.meta?.turnFileArchive === true;
  const scope = {
    kind: "session" as const,
    agentId: artifact.agentId ?? "default",
    sessionId: String(artifact.meta?.turnSessionId ?? artifact.sessionId ?? ""),
    chatId: artifact.chatId,
  };
  let manifest: ReturnType<typeof turnFilesApi.get> | undefined;
  let bytes = 0;
  const headers = buildWorkspaceScopeHeaders(artifact);
  const localPath = (value: string, from: string): string | undefined => {
    const target = resolveWorkspaceMarkdownTarget(value, from);
    return target.kind === "workspace" ? target.path : undefined;
  };
  const read = async (path: string): Promise<ArrayBuffer> => {
    signal?.throwIfAborted();
    // Only presentation assets enter the iframe, never arbitrary config files.
    if (
      !/\.(?:css|m?js|cjs|png|jpe?g|gif|webp|avif|bmp|svg|ico|woff2?|ttf|otf)$/i.test(
        path,
      )
    )
      throw new Error("Unsupported presentation resource");
    let url: string;
    if (archive) {
      if (!scope.sessionId || !artifact.meta?.turnId)
        throw new Error("Missing archive identity");
      manifest ??= turnFilesApi.get(scope, String(artifact.meta.turnId));
      const turn = await manifest;
      const version = artifact.meta.version === "before" ? "before" : "after";
      const file = turn.files.find(
        (entry) => entry.path === path && entry.root === artifact.workspaceRoot,
      );
      if (
        !file ||
        !(version === "before" ? file.before_available : file.after_available)
      ) {
        throw new Error("Resource not archived");
      }
      url = turnFilesApi.fileUrl(scope, turn.id, file.id, version);
    } else {
      url = isAbsoluteLocalFilePath(path)
        ? chatApi.filePreviewUrl(path)
        : workspaceApi.getFileDownloadUrl(
            path,
            artifact.workspaceRoot ?? "project",
          );
    }
    const response = await fetch(url, { headers, signal });
    if (!response.ok)
      throw new Error(`Resource unavailable: ${response.status}`);
    if (Number(response.headers.get("content-length")) > 2 * 1024 * 1024)
      throw new Error("Preview resource limit");
    const buffer = await response.arrayBuffer();
    bytes += buffer.byteLength;
    if (buffer.byteLength > 2 * 1024 * 1024 || bytes > 8 * 1024 * 1024)
      throw new Error("Preview resource limit");
    return buffer;
  };
  const dataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  const replaceAsync = async (
    text: string,
    pattern: RegExp,
    replace: (match: RegExpMatchArray) => Promise<string>,
  ) => {
    let result = "";
    let offset = 0;
    for (const match of text.matchAll(pattern)) {
      result += text.slice(offset, match.index) + (await replace(match));
      offset = match.index! + match[0].length;
    }
    return result + text.slice(offset);
  };
  const resolve = async (
    value: string,
    from: string,
    css = false,
    parents: string[] = [],
  ): Promise<string> => {
    const path = localPath(value, from);
    if (!path) return value;
    if (parents.includes(path)) return "data:text/css,";
    const key = `${css}:${path}`;
    if (!cache.has(key)) {
      cache.set(
        key,
        (async () => {
          if (cache.size >= 32) throw new Error("Preview resource limit");
          const buffer = await read(path);
          let blob: Blob;
          if (css) {
            let text = new TextDecoder().decode(buffer);
            // Preserve @import order and media conditions while resolving each
            // stylesheet's own relative paths. Cycles are stopped per ancestry.
            text = await replaceAsync(
              text,
              /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?([^;]*);/gi,
              async (match) =>
                `@import url("${await resolve(match[1], path, true, [
                  ...parents,
                  path,
                ])}")${match[2]};`,
            );
            text = await replaceAsync(
              text,
              /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/gi,
              async (match) =>
                `url("${await resolve(
                  match[1] ?? match[2] ?? match[3],
                  path,
                  false,
                  [...parents, path],
                )}")`,
            );
            blob = new Blob([text], { type: "text/css;charset=utf-8" });
          } else {
            blob = new Blob([buffer], {
              type: mimeFromExtension(path) ?? "application/octet-stream",
            });
          }
          return dataUrl(blob);
        })().catch((error) => {
          if (signal?.aborted) throw error;
          missing.add(path);
          return css ? "data:text/css," : "data:,";
        }),
      );
    }
    return cache.get(key)!;
  };
  let changed = false;
  for (const element of doc.querySelectorAll(
    "link[rel~='stylesheet'][href],img[src],script[src]",
  )) {
    const attr = element.tagName === "LINK" ? "href" : "src";
    const value = element.getAttribute(attr)!;
    if (!localPath(value, artifact.workspacePath)) continue;
    element.setAttribute(
      attr,
      await resolve(value, artifact.workspacePath, element.tagName === "LINK"),
    );
    changed = true;
  }
  signal?.throwIfAborted();
  return {
    content: changed
      ? `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`
      : content,
    missing: [...missing],
  };
}
