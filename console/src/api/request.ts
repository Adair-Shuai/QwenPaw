import { getApiUrl, clearAuthToken } from "./config";
import { buildAuthHeaders } from "./authHeaders";
import { getLoginHref, isLoginPath } from "../utils/navigationMode";

export class ApiError extends Error {
  status: number;
  reason?: string;

  constructor(message: string, status: number, reason?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reason = reason;
  }
}

function parseErrorPayload(text: string, contentType: string): {
  message: string | null;
  reason?: string;
} {
  if (!text) {
    return { message: null };
  }

  if (!contentType.includes("application/json")) {
    return { message: text };
  }

  try {
    const payload = JSON.parse(text) as {
      detail?: unknown;
      message?: unknown;
      error?: unknown;
    };

    if (typeof payload.detail === "string" && payload.detail) {
      return { message: payload.detail };
    }
    if (
      payload.detail &&
      typeof payload.detail === "object" &&
      !Array.isArray(payload.detail)
    ) {
      const detail = payload.detail as {
        message?: unknown;
        reason?: unknown;
      };
      return {
        message:
          typeof detail.message === "string" && detail.message
            ? detail.message
            : text,
        reason:
          typeof detail.reason === "string" ? detail.reason : undefined,
      };
    }
    if (typeof payload.message === "string" && payload.message) {
      return { message: payload.message };
    }
    if (typeof payload.error === "string" && payload.error) {
      return { message: payload.error };
    }
  } catch {
    return { message: text };
  }

  return { message: text };
}

function buildHeaders(method?: string, extra?: HeadersInit): Headers {
  // Normalize extra to a Headers instance for consistent handling
  const headers = extra instanceof Headers ? extra : new Headers(extra);

  // Only add Content-Type for methods that typically have a body
  if (method && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    // Don't override if caller explicitly set Content-Type
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  for (const [key, value] of Object.entries(buildAuthHeaders())) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }

  return headers;
}

export interface RequestOptions extends RequestInit {
  /** Request timeout in milliseconds. Defaults to 30000 (30 seconds). */
  timeout?: number;
  /** Number of retry attempts on timeout. Defaults to 0 (no retry). */
  retries?: number;
  /** Delay between retries in milliseconds. Defaults to 1000 (1 second). */
  retryDelay?: number;
}

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_RETRIES = 0;
const DEFAULT_RETRY_DELAY_MS = 1000;

export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = getApiUrl(path);
  const method = options.method || "GET";
  const headers = buildHeaders(method, options.headers);
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
    signal: callerSignal,
    ...fetchOptions
  } = options;

  // Early exit: caller's signal already aborted before we even start
  if (callerSignal?.aborted) {
    throw new DOMException("The operation was aborted", "AbortError");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    // Create AbortController for timeout handling
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);

    // Wire caller's signal to our controller so external abort also works
    let onCallerAbort: (() => void) | undefined;
    if (callerSignal) {
      if (callerSignal.aborted) {
        controller.abort();
      } else {
        onCallerAbort = () => controller.abort();
        callerSignal.addEventListener("abort", onCallerAbort, { once: true });
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthToken();
          if (!isLoginPath(window.location.pathname)) {
            window.location.href = getLoginHref(window.location);
          }
          throw new Error("Not authenticated");
        }

        const text = await response.text().catch(() => "");
        const contentType = response.headers.get("content-type") || "";
        const parsed = parseErrorPayload(text, contentType);

        // Preserve raw body for parseErrorDetail() to extract structured fields
        const finalMessage = parsed.message
          ? `${parsed.message} - ${text}`
          : `Request failed: ${response.status} ${response.statusText}`;

        throw new ApiError(finalMessage, response.status, parsed.reason);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return (await response.text()) as unknown as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError" &&
        !timedOut
      ) {
        // External abort (caller cancelled): do not retry, rethrow as-is
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        // Timeout-triggered abort
        lastError = new Error(
          `Request timeout after ${timeout}ms: ${method} ${path}`,
        );

        // Retry if we have attempts remaining
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
      } else {
        // Non-timeout errors should not retry
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
      if (onCallerAbort && callerSignal) {
        callerSignal.removeEventListener("abort", onCallerAbort);
      }
    }
  }

  // All retries exhausted
  throw lastError;
}
