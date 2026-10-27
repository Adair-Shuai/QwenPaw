import type { ViewerMountOptions } from "../contracts/types";

type PersistenceOptions = Pick<
  ViewerMountOptions,
  "apiBase" | "headers" | "persistenceKey"
>;
type PersistenceKind = "scene" | "userView";

const SCOPE_HEADERS = [
  "x-agent-id",
  "x-chat-id",
  "x-project-id",
  "x-project-dir",
  "x-session-project-dir",
] as const;

/** Stable local namespace; authentication secrets never participate in storage keys. */
export function viewerPersistenceKey(
  options: PersistenceOptions,
  kind: PersistenceKind,
): string {
  const legacyKey = `ugsci.visualization.${kind}`;
  const headers = new Map(
    Object.entries(options.headers ?? {}).map(([name, value]) => [
      name.toLowerCase(),
      value.trim(),
    ]),
  );
  const scope = SCOPE_HEADERS.flatMap((name) => {
    let value = headers.get(name);
    // Match the host's handling of folded Agent headers. Project paths may
    // contain commas and must retain their exact value.
    if (name === "x-agent-id" && value) {
      const agents = value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      value = agents[agents.length - 1];
    }
    return value ? [[name, value]] : [];
  });
  const namespace = options.persistenceKey?.trim() || "";
  // Standalone viewers retain their existing saved state. Scoped viewers
  // never import an old global value whose owning Agent cannot be known.
  if (!scope.length && !namespace) return legacyKey;

  const source = options.apiBase.trim();
  let endpoint = source.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  try {
    const url = new URL(source, "https://viewer.invalid");
    const absolute =
      /^[a-z][a-z\d+.-]*:\/\//i.test(source) || source.startsWith("//");
    endpoint = `${absolute ? url.origin : ""}${url.pathname.replace(
      /\/+$/,
      "",
    )}`;
  } catch {
    // A malformed endpoint still gets a deterministic namespace without
    // preserving URL credentials or query parameters.
    endpoint = endpoint.replace(/^(.*?:\/\/)[^/]*@/, "$1");
  }
  return `${legacyKey}:v1:${encodeURIComponent(
    JSON.stringify([endpoint, scope, namespace]),
  )}`;
}
