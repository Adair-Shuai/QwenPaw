import type {
  InteractionRequest,
  InteractionScope,
  InputValues,
} from "./types";

const key = (scope: InteractionScope, id: string) =>
  `qwenpaw:input-draft:${encodeURIComponent(
    scope.agentId,
  )}:${encodeURIComponent(scope.sessionId)}:${encodeURIComponent(id)}`;

/** Immediate local draft survives a closed panel; explicit Save also persists to the server. */
export function readInputDraftState(
  scope: InteractionScope,
  request: InteractionRequest,
) {
  const original = {
    values: request.answer ?? request.values,
    revision: request.revision,
    dirty: false,
  };
  if (request.status !== "pending") return original;
  try {
    const saved = JSON.parse(
      localStorage.getItem(key(scope, request.id)) || "null",
    );
    if (
      Number.isInteger(saved?.revision) &&
      saved.values &&
      typeof saved.values === "object" &&
      !Array.isArray(saved.values)
    ) {
      return {
        values: saved.values as InputValues,
        revision: saved.revision as number,
        dirty:
          saved.revision !== request.revision ||
          JSON.stringify(saved.values) !== JSON.stringify(request.values),
      };
    }
  } catch {
    /* The server values remain available when browser storage is unavailable. */
  }
  return original;
}
export function readInputDraft(
  scope: InteractionScope,
  request: InteractionRequest,
): InputValues {
  return readInputDraftState(scope, request).values;
}
export function saveInputDraft(
  scope: InteractionScope,
  request: InteractionRequest,
  values: InputValues,
): boolean {
  try {
    localStorage.setItem(
      key(scope, request.id),
      JSON.stringify({ revision: request.revision, values }),
    );
    return true;
  } catch {
    return false;
  }
}
export function clearInputDraft(scope: InteractionScope, id: string) {
  try {
    localStorage.removeItem(key(scope, id));
  } catch {
    /* optional browser storage */
  }
}
