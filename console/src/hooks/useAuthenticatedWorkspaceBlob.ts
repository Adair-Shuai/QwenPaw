import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { workspaceApi } from "../api/modules/workspace";
import { buildAuthHeaders } from "../api/authHeaders";
import { isDesktopTauriRuntime } from "../utils/openExternalLink";
import { mimeFromExtension } from "../utils/mimeForPreview";

export type AuthenticatedWorkspaceBlobStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export interface AuthenticatedWorkspaceBlobResource {
  status: AuthenticatedWorkspaceBlobStatus;
  url: string | null;
  error: Error | null;
  retry: () => void;
}

class WorkspaceBinaryLoadError extends Error {
  status: number;

  constructor(status: number, detail: string) {
    super(detail ? `${status}: ${detail}` : `${status}`);
    this.name = "WorkspaceBinaryLoadError";
    this.status = status;
  }
}

async function responseError(response: Response): Promise<Error> {
  let detail = response.statusText;
  try {
    const payload = (await response.json()) as { detail?: unknown };
    if (typeof payload.detail === "string") detail = payload.detail;
  } catch {
    // Keep the HTTP status text when the response is not JSON.
  }
  return new WorkspaceBinaryLoadError(response.status, detail);
}

/** Load a workspace binary with the owning Agent's credentials. */
export function useAuthenticatedWorkspaceBlob(
  filePath: string | null,
  agentId?: string,
): AuthenticatedWorkspaceBlobResource {
  const [attempt, setAttempt] = useState(0);
  const [resource, setResource] = useState<
    Omit<AuthenticatedWorkspaceBlobResource, "retry">
  >({
    status: filePath ? "loading" : "idle",
    url: null,
    error: null,
  });
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let objectUrl: string | null = null;

    if (!filePath) {
      setResource({ status: "idle", url: null, error: null });
      return () => controller.abort();
    }

    const loadBlob = async (): Promise<Blob> => {
      if (isDesktopTauriRuntime()) {
        try {
          const response = await invoke<ArrayBuffer | number[]>(
            "read_workspace_binary_file",
            { filePath, agentId },
          );
          const bytes = new Uint8Array(response);
          return new Blob([bytes], {
            type: mimeFromExtension(filePath) ?? "application/octet-stream",
          });
        } catch {
          // Fall through to the authenticated HTTP endpoint.
        }
      }

      const response = await fetch(workspaceApi.getBinaryFileUrl(filePath), {
        headers: buildAuthHeaders(agentId),
        signal: controller.signal,
      });
      if (!response.ok) throw await responseError(response);
      return response.blob();
    };

    setResource({ status: "loading", url: null, error: null });
    void loadBlob()
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setResource({ status: "ready", url: objectUrl, error: null });
      })
      .catch((error: unknown) => {
        if (
          cancelled ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }
        setResource({
          status: "error",
          url: null,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [agentId, attempt, filePath]);

  return { ...resource, retry };
}
