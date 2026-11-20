import { invoke } from "@tauri-apps/api/core";
import { buildWorkspaceScopeHeaders } from "../../api/authHeaders";
import { getApiToken, getApiUrl } from "../../api/config";
import { request as apiRequest } from "../../api/request";
import { chatApi } from "../../api/modules/chat";
import {
  turnFilesSessionId,
  type SessionFilesScope,
} from "../../api/modules/turnFiles";
import { workspaceApi } from "../../api/modules/workspace";
import {
  isDesktopTauriRuntime,
  isHttpExternalUrl,
  resolveExternalUrl,
} from "../../utils/openExternalLink";
import { isAbsoluteLocalFilePath } from "./internalFileLinks";
import type { FileTarget } from "./types";

export interface DeliveryApplication {
  id: string;
  name: string;
  iconDataUrl?: string | null;
  isDefault: boolean;
}

export interface DeliveryApplications {
  applications: DeliveryApplication[];
  canOpenDefault: boolean;
  canChooseApplication: boolean;
  editorOnly?: boolean;
}

export interface DeliveryNativeOptions {
  /** Check the originating scope/request after every asynchronous boundary. */
  isCurrent?: () => boolean;
}

interface StagedDeliveryFile {
  token: string;
  fileName: string;
  path: string;
}

export interface DeliveryFileRequest {
  url: string;
  fileName: string;
  headers: Record<string, string>;
  credentials: RequestCredentials;
  cacheKey?: string;
}

interface StageEntry {
  pending?: Promise<StagedDeliveryFile>;
  value?: StagedDeliveryFile;
  waiters: Set<() => boolean>;
}

const MAX_FILE_BYTES = 32 * 1024 * 1024;
const APPLICATION_CACHE_MS = 30_000;
const MAX_APPLICATION_CACHE_ENTRIES = 64;
const stagedFiles = new Map<string, StageEntry>();
const applicationLists = new Map<
  string,
  {
    at: number;
    value?: DeliveryApplications;
    pending?: Promise<DeliveryApplications>;
  }
>();
let cacheRuntime: unknown;

export function isDeliveryNativeAvailable(): boolean {
  if (isDesktopTauriRuntime()) return true;
  if (typeof window === "undefined") return false;
  const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
  return (
    loopback.has(window.location.hostname) &&
    loopback.has(new URL(getApiUrl("/"), window.location.href).hostname)
  );
}

async function desktopRequest<T>(
  action: string,
  scope: SessionFilesScope,
  body?: unknown,
  fileName?: string,
): Promise<T> {
  const query = new URLSearchParams({ session_id: turnFilesSessionId(scope) });
  if (fileName) query.set("file_name", fileName);
  return apiRequest<T>(`/workspace/turn-files/desktop/${action}?${query}`, {
    method: body ? "POST" : "GET",
    headers: buildWorkspaceScopeHeaders(scope),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

function currentRuntime(): unknown {
  return typeof window === "undefined"
    ? undefined
    : (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ ??
        window;
}

function requireRuntime(): unknown {
  if (!isDeliveryNativeAvailable()) {
    stagedFiles.clear();
    applicationLists.clear();
    cacheRuntime = undefined;
    throw new Error("Native delivery files are unavailable");
  }
  const runtime = currentRuntime();
  if (runtime !== cacheRuntime) {
    stagedFiles.clear();
    applicationLists.clear();
    cacheRuntime = runtime;
  }
  return runtime;
}

function assertCurrent(isCurrent: () => boolean): void {
  if (!isCurrent()) {
    throw new DOMException(
      "Delivery file request is no longer current",
      "AbortError",
    );
  }
}

/** App associations belong to a suffix, so mounting a history shares enumeration. */
export async function listDeliveryApplications(
  fileName: string,
  refresh = false,
  scope?: SessionFilesScope,
): Promise<DeliveryApplications> {
  const runtime = requireRuntime();
  const name = fileName.replace(/\\/g, "/").split("/").pop() || "download";
  const suffix = name.match(/\.[^.]+$/)?.[0].toLowerCase();
  const key = JSON.stringify([
    suffix ?? `name:${name.toLowerCase()}`,
    getApiUrl("/"),
    isDesktopTauriRuntime() ? undefined : scope,
  ]);
  const cached = applicationLists.get(key);
  if (cached?.pending) return cached.pending;
  if (
    !refresh &&
    cached?.value &&
    Date.now() - cached.at < APPLICATION_CACHE_MS
  ) {
    return cached.value;
  }
  const entry: {
    at: number;
    value?: DeliveryApplications;
    pending?: Promise<DeliveryApplications>;
  } = { at: 0 };
  const listing = isDesktopTauriRuntime()
    ? invoke<DeliveryApplications>("list_delivery_file_applications", {
        fileName: name,
      })
    : scope
    ? desktopRequest<DeliveryApplications>(
        "applications",
        scope,
        undefined,
        name,
      )
    : Promise.reject(new Error("Delivery scope is required"));
  entry.pending = listing
    .then((value) => {
      if (runtime === cacheRuntime) {
        entry.value = value;
        entry.at = Date.now();
      }
      return value;
    })
    .catch((error: unknown) => {
      if (applicationLists.get(key) === entry) applicationLists.delete(key);
      throw error;
    })
    .finally(() => {
      entry.pending = undefined;
    });
  applicationLists.set(key, entry);
  if (applicationLists.size > MAX_APPLICATION_CACHE_ENTRIES) {
    applicationLists.delete(applicationLists.keys().next().value!);
  }
  return entry.pending;
}

export function prepareDeliveryFileRequest(
  target: FileTarget,
  scope: SessionFilesScope,
): DeliveryFileRequest {
  const artifact = target.artifact;
  if (
    (artifact?.agentId && artifact.agentId !== scope.agentId) ||
    (artifact?.sessionId && artifact.sessionId !== scope.sessionId) ||
    (artifact?.chatId && artifact.chatId !== scope.chatId)
  ) {
    throw new Error("Delivery file does not belong to this scope");
  }
  const archived = artifact?.meta?.turnFileArchive === true;
  // An archived target must never be reconstructed from its mutable workspace path.
  let url = artifact?.binaryUrl || target.artifactUrl;
  const fileName =
    (artifact?.title || target.path).replace(/\\/g, "/").split("/").pop() ||
    "download";
  if (!url && !archived && artifact?.textContent != null) {
    url = `data:${
      artifact.mimeType || "text/plain"
    };charset=utf-8,${encodeURIComponent(artifact.textContent)}`;
  }
  if (!archived && url?.startsWith("data:")) {
    return { url, fileName, headers: {}, credentials: "omit" };
  }
  if (!url && !archived) {
    if (target.source === "workspace") {
      url = isAbsoluteLocalFilePath(target.path)
        ? chatApi.filePreviewUrl(target.path)
        : workspaceApi.getFileDownloadUrl(
            target.path,
            target.root ?? "project",
          );
    } else if (target.source === "attachment") {
      url = chatApi.filePreviewUrl(target.path);
    }
  }
  const resolvedUrl = url ? resolveExternalUrl(url) : null;
  if (!resolvedUrl || !isHttpExternalUrl(resolvedUrl)) {
    throw new Error("Delivery file has no readable binary URL");
  }
  const backendUrl = resolveExternalUrl(getApiUrl("/"));
  if (!backendUrl || !isHttpExternalUrl(backendUrl)) {
    throw new Error("Delivery backend URL is invalid");
  }
  // Desktop's API origin can differ from the WebView origin. Trust only the
  // configured backend, never an origin supplied by an artifact/tool result.
  const trustedBackend =
    new URL(resolvedUrl).origin === new URL(backendUrl).origin;
  if (archived && !trustedBackend) {
    throw new Error(
      "Archived delivery file must belong to the configured backend",
    );
  }
  const headers = trustedBackend ? buildWorkspaceScopeHeaders(scope) : {};
  const credentials: RequestCredentials = trustedBackend
    ? "same-origin"
    : "omit";
  // Keep credentials only in memory. Every owning identity and binary URL matters;
  // using only a workspace path or an artifact id can alias older archive versions.
  const cacheKey = archived
    ? JSON.stringify([
        scope.kind,
        scope.agentId,
        scope.sessionId,
        scope.chatId,
        scope.projectDirOverride,
        target.source,
        target.root,
        target.path,
        artifact?.id,
        artifact?.agentId,
        artifact?.sessionId,
        artifact?.chatId,
        artifact?.workspacePath,
        artifact?.workspaceRoot,
        artifact?.projectRoot,
        artifact?.projectDirOverride,
        artifact?.meta,
        artifact?.binaryUrl,
        target.artifactUrl,
        resolvedUrl,
        fileName,
        headers,
      ])
    : undefined;
  return { url: resolvedUrl, fileName, headers, credentials, cacheKey };
}

function base64Bytes(bytes: Uint8Array): string {
  // Small chunks avoid the argument limit for large binary files.
  const chunks: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    chunks.push(
      String.fromCharCode(...bytes.subarray(offset, offset + 0x8000)),
    );
  }
  return btoa(chunks.join(""));
}

async function stageFile(
  request: DeliveryFileRequest,
  isCurrent: () => boolean,
  scope: SessionFilesScope,
): Promise<StagedDeliveryFile> {
  assertCurrent(isCurrent);
  const response = await fetch(request.url, {
    headers: request.headers,
    credentials: request.credentials,
    // X-Agent-Id/X-Chat-Id must never follow a backend redirect to another origin.
    redirect: "error",
    cache: "no-store",
  });
  assertCurrent(isCurrent);
  if (!response.ok)
    throw new Error(`Delivery file read failed: ${response.status}`);
  const contentLength = Number(response.headers.get("Content-Length"));
  if (contentLength > MAX_FILE_BYTES)
    throw new Error("Delivery file exceeds 32 MiB");
  const bytes = new Uint8Array(await response.arrayBuffer());
  assertCurrent(isCurrent);
  if (bytes.length > MAX_FILE_BYTES)
    throw new Error("Delivery file exceeds 32 MiB");
  const contentBase64 = base64Bytes(bytes);
  assertCurrent(isCurrent);
  const body = { fileName: request.fileName, contentBase64 };
  const staged = isDesktopTauriRuntime()
    ? await invoke<StagedDeliveryFile>("stage_delivery_file", { request: body })
    : await desktopRequest<StagedDeliveryFile>("stage", scope, body);
  assertCurrent(isCurrent);
  return staged;
}

async function deliveryToken(
  request: DeliveryFileRequest,
  isCurrent: () => boolean,
  scope: SessionFilesScope,
): Promise<StagedDeliveryFile> {
  if (!request.cacheKey) return stageFile(request, isCurrent, scope);
  const key = request.cacheKey;
  let entry = stagedFiles.get(key);
  if (entry?.value) return entry.value;
  if (!entry) {
    entry = { waiters: new Set() };
    stagedFiles.set(key, entry);
  }
  const shared = entry;
  shared.waiters.add(isCurrent);
  if (!shared.pending) {
    shared.pending = stageFile(
      request,
      () => [...shared.waiters].some((waiter) => waiter()),
      scope,
    )
      .then((value) => {
        shared.value = value;
        return value;
      })
      .catch((error: unknown) => {
        if (stagedFiles.get(key) === shared) stagedFiles.delete(key);
        throw error;
      });
  }
  try {
    return await shared.pending;
  } finally {
    shared.waiters.delete(isCurrent);
  }
}

async function runFileAction(
  target: FileTarget,
  scope: SessionFilesScope,
  command: "open_delivery_file" | "reveal_delivery_file",
  applicationId: string | undefined,
  options: DeliveryNativeOptions,
): Promise<void> {
  const runtime = requireRuntime();
  const credential = getApiToken();
  const backendUrl = getApiUrl("/");
  const isCurrent = () =>
    isDeliveryNativeAvailable() &&
    currentRuntime() === runtime &&
    getApiToken() === credential &&
    getApiUrl("/") === backendUrl &&
    (options.isCurrent?.() ?? true);
  assertCurrent(isCurrent);
  // Capture URL, scope, headers and identity synchronously before any await.
  const request = prepareDeliveryFileRequest(target, { ...scope });
  const staged = await deliveryToken(request, isCurrent, scope);
  assertCurrent(isCurrent);
  try {
    if (isDesktopTauriRuntime()) {
      await invoke<void>(command, {
        token: staged.token,
        ...(command === "open_delivery_file" && applicationId
          ? { applicationId }
          : {}),
      });
    } else {
      await desktopRequest("action", scope, {
        token: staged.token,
        action: command === "open_delivery_file" ? "open" : "reveal",
        ...(applicationId ? { applicationId } : {}),
      });
    }
  } catch (error) {
    // External applications may change or delete a staged copy. A user's next
    // attempt must re-read the archive, without automatically launching twice.
    if (
      request.cacheKey &&
      stagedFiles.get(request.cacheKey)?.value === staged
    ) {
      stagedFiles.delete(request.cacheKey);
    }
    throw error;
  }
}

export function openDeliveryFile(
  target: FileTarget,
  scope: SessionFilesScope,
  applicationId?: string,
  options: DeliveryNativeOptions = {},
): Promise<void> {
  return runFileAction(
    target,
    scope,
    "open_delivery_file",
    applicationId,
    options,
  );
}

export function revealDeliveryFile(
  target: FileTarget,
  scope: SessionFilesScope,
  options: DeliveryNativeOptions = {},
): Promise<void> {
  return runFileAction(
    target,
    scope,
    "reveal_delivery_file",
    undefined,
    options,
  );
}
