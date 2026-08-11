/**
 * hostSdk/fetch.ts — auth-aware fetch wrapper for plugins.
 *
 * Reuses `buildAuthHeaders()` which already injects `Authorization`
 * and `X-Agent-Id` from the agent store. Plugin callers pass an API path
 * (e.g. "/console/chat") and get back a normal Response.
 */
import { getApiUrl } from "../../api/config";
import { buildAuthHeaders } from "../../api/authHeaders";

export async function hostFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  // Header names are case-insensitive, but plain-object spreading is not.
  // Plugin callers commonly pass `x-agent-id` after their Headers object has
  // been normalized, while buildAuthHeaders() returns `X-Agent-Id`. Passing
  // both keys to fetch combines them into `agent-a, agent-a`, which the
  // backend correctly rejects as an unknown Agent. Merge through Headers.set
  // so caller-provided scope overrides the host default exactly once.
  const headers = new Headers(buildAuthHeaders());
  new Headers(init?.headers).forEach((value, key) => {
    headers.set(key, value);
  });
  return fetch(getApiUrl(path), { ...init, headers });
}
