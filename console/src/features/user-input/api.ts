import { hostFetch } from "../../plugins/hostSdk/fetch";
import type {
  InteractionRequest,
  InteractionScope,
  InputValues,
} from "./types";

export class InteractionApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function call<T>(
  scope: InteractionScope,
  path = "",
  init?: RequestInit,
): Promise<T> {
  const response = await hostFetch(`/openui/interactions${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": scope.agentId,
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    throw new InteractionApiError(
      typeof detail === "string"
        ? detail
        : `请求失败（${response.status}），请检查参数或重新加载。`,
      response.status,
    );
  }
  return data as T;
}

export const interactionApi = {
  list: (scope: InteractionScope, signal?: AbortSignal) =>
    call<{ requests: InteractionRequest[] }>(
      scope,
      `?session_id=${encodeURIComponent(scope.sessionId)}`,
      { signal },
    ),
  demo: (scope: InteractionScope) =>
    call<InteractionRequest>(scope, "/demo", {
      method: "POST",
      body: JSON.stringify({ session_id: scope.sessionId }),
    }),
  draft: (
    scope: InteractionScope,
    request: InteractionRequest,
    values: InputValues,
  ) =>
    call<InteractionRequest>(
      scope,
      `/${encodeURIComponent(request.id)}/draft`,
      {
        method: "PUT",
        body: JSON.stringify({
          session_id: scope.sessionId,
          expected_revision: request.revision,
          values,
        }),
      },
    ),
  submit: (
    scope: InteractionScope,
    request: InteractionRequest,
    values: InputValues,
  ) =>
    call<{ request: InteractionRequest; continuation: string }>(
      scope,
      `/${encodeURIComponent(request.id)}/submit`,
      {
        method: "POST",
        body: JSON.stringify({
          session_id: scope.sessionId,
          expected_revision: request.revision,
          values,
        }),
      },
    ),
  cancel: (scope: InteractionScope, request: InteractionRequest) =>
    call<InteractionRequest>(
      scope,
      `/${encodeURIComponent(request.id)}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({
          session_id: scope.sessionId,
          expected_revision: request.revision,
        }),
      },
    ),
  queued: (scope: InteractionScope, id: string) =>
    call<InteractionRequest>(scope, `/${encodeURIComponent(id)}/queued`, {
      method: "POST",
      body: JSON.stringify({ session_id: scope.sessionId }),
    }),
};
