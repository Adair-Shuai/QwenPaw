/**
 * GenUI Media URL Adapter — resolves workspace-relative and absolute file
 * paths to authenticated blob URLs for use in Image and other media
 * components.
 *
 * PLAN §6.1: "文件 URL adapter" — bridges GenUI media props to the host's
 * authenticated workspace blob loading mechanism.
 *
 * Resolution rules:
 * 1. http(s)://, data:, blob: URLs → returned as-is.
 * 2. workspace://path → resolved via host workspace API.
 * 3. Relative paths (no scheme) → resolved via host workspace binary API.
 * 4. Absolute local paths (/Users/..., C:\...) → resolved via host file preview API.
 *
 * The adapter uses an in-memory cache to avoid re-fetching the same blob.
 */

/** Cache: filePath → blobURL (or null if resolution failed) */
const _urlCache = new Map<string, string | null>();
const MAX_MEDIA_CACHE_ENTRIES = 128;

/** Set of active fetch promises to deduplicate concurrent requests */
const _pending = new Map<string, Promise<string | null>>();

/**
 * Determine if a URL string is an absolute web URL (http/https) or data/blob URL
 * that should be used directly without workspace resolution.
 */
export function isDirectUrl(src: string): boolean {
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  );
}

/**
 * Determine if a path looks like an absolute local file path.
 * Handles Unix (/), Windows (C:\, D:\), and UNC (\\) paths.
 */
export function isAbsoluteLocalPath(path: string): boolean {
  if (!path) return false;
  // Unix absolute
  if (path.startsWith("/")) return true;
  // Windows drive letter: C:\ or C:/
  if (/^[A-Za-z]:[\\/]/.test(path)) return true;
  // UNC path
  if (path.startsWith("\\\\")) return true;
  return false;
}

/**
 * Determine if a path uses the workspace:// scheme.
 */
export function isWorkspaceScheme(path: string): boolean {
  return path.startsWith("workspace://");
}

/**
 * Strip the workspace:// scheme prefix and return the raw path.
 */
export function stripWorkspaceScheme(path: string): string {
  if (isWorkspaceScheme(path)) {
    return path.slice("workspace://".length);
  }
  return path;
}

/**
 * Resolve a media source URL to an authenticated blob URL.
 *
 * This function:
 * 1. Returns direct URLs (http, data, blob) immediately.
 * 2. For workspace/relative/absolute paths, fetches the binary via the host's
 *    authenticated API and creates a blob URL.
 * 3. Caches results to avoid redundant fetches.
 * 4. Deduplicates concurrent requests for the same path.
 *
 * @param src The source path or URL from the GenUI Image component props.
 * @returns A promise resolving to the resolved URL, or null if resolution fails.
 */
export async function resolveMediaUrl(src: string): Promise<string | null> {
  if (!src) return null;

  // Direct URLs — no resolution needed
  if (isDirectUrl(src)) return src;

  // Check cache first
  if (_urlCache.has(src)) {
    return _urlCache.get(src) ?? null;
  }

  // Check if there's already a pending request for this src
  if (_pending.has(src)) {
    return _pending.get(src)!;
  }

  // Start a new resolution
  const promise = _fetchBlobUrl(src);
  _pending.set(src, promise);

  try {
    const url = await promise;
    if (!_urlCache.has(src) && _urlCache.size >= MAX_MEDIA_CACHE_ENTRIES) {
      const oldestKey = _urlCache.keys().next().value as string | undefined;
      if (oldestKey !== undefined) {
        const oldestUrl = _urlCache.get(oldestKey);
        if (oldestUrl?.startsWith("blob:")) URL.revokeObjectURL(oldestUrl);
        _urlCache.delete(oldestKey);
      }
    }
    _urlCache.set(src, url);
    return url;
  } finally {
    _pending.delete(src);
  }
}

/**
 * Internal: fetch a blob URL for a workspace/absolute path via the host API.
 */
async function _fetchBlobUrl(filePath: string): Promise<string | null> {
  const QP = (window as any).QwenPaw;
  const host = QP?.host;

  if (!host) {
    console.warn("[ugsci.genui] Host runtime not available for media resolution");
    return null;
  }

  // Normalize workspace:// scheme
  const cleanPath = stripWorkspaceScheme(filePath);

  // Try host's workspace blob loader if available
  // The host may expose a `resolveWorkspaceBlob` function that handles
  // authentication, Tauri invocation, and blob creation.
  if (typeof host.resolveWorkspaceBlob === "function") {
    try {
      const url = await host.resolveWorkspaceBlob(cleanPath);
      if (url) return url;
    } catch (err) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", err);
    }
  }

  // Fall back to direct authenticated fetch
  try {
    return await _fetchBlobViaHttp(cleanPath, host);
  } catch (err) {
    console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${filePath}':`,
      err,
    );
    return null;
  }
}

/**
 * Internal: fetch a blob via the authenticated HTTP API.
 *
 * Uses the host's workspace API endpoints:
 * - Absolute local paths → chatApi.filePreviewUrl
 * - Relative workspace paths → workspaceApi.getBinaryFileUrl
 */
async function _fetchBlobViaHttp(
  filePath: string,
  host: any,
): Promise<string | null> {
  // Determine the correct URL based on path type
  let url: string | null = null;

  // Try host API modules
  const workspaceApi = host?.workspaceApi;
  const chatApi = host?.chatApi;

  if (isAbsoluteLocalPath(filePath) && chatApi?.filePreviewUrl) {
    url = chatApi.filePreviewUrl(filePath);
  } else if (workspaceApi?.getBinaryFileUrl) {
    url = workspaceApi.getBinaryFileUrl(filePath);
  }

  if (!url) {
    // Last resort: use the path directly (may work for public URLs)
    return filePath;
  }

  // Build auth headers
  const headers: Record<string, string> = {};
  const buildAuth = host?.buildAuthHeaders;
  if (typeof buildAuth === "function") {
    try {
      const authHeaders = buildAuth();
      if (authHeaders && typeof authHeaders === "object") {
        Object.assign(headers, authHeaders);
      }
    } catch {
      // Ignore auth header errors
    }
  }

  // Fetch and create blob URL
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Synchronously get a cached media URL if available.
 * Returns null if the URL hasn't been resolved yet.
 *
 * Useful for React components that want to render immediately with
 * a cached URL and trigger async resolution as a fallback.
 */
export function getCachedMediaUrl(src: string): string | null {
  if (!src) return null;
  if (isDirectUrl(src)) return src;
  return _urlCache.get(src) ?? null;
}

/**
 * Preload a media URL (fire-and-forget).
 * Useful for pre-fetching images before they're rendered.
 */
export function preloadMediaUrl(src: string): void {
  if (!src || isDirectUrl(src)) return;
  if (_urlCache.has(src) || _pending.has(src)) return;
  void resolveMediaUrl(src);
}

/**
 * Clear the media URL cache.
 * Should be called when the session changes to avoid stale blob URLs.
 */
export function clearMediaCache(): void {
  for (const url of _urlCache.values()) {
    if (url && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore
      }
    }
  }
  _urlCache.clear();
}
