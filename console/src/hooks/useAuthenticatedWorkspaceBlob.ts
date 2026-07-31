import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { workspaceApi } from "../api/modules/workspace";
import { buildAuthHeaders } from "../api/authHeaders";
import { isDesktopTauriRuntime } from "../utils/openExternalLink";
import { mimeFromExtension } from "../utils/mimeForPreview";

/** Load a workspace binary with the owning Agent's credentials. */
export function useAuthenticatedWorkspaceBlob(
  filePath: string | null,
  agentId?: string,
): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const loadBlob = async (): Promise<Blob | null> => {
      if (!filePath) return null;

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
      });
      if (!response.ok) throw new Error(`${response.status}`);
      return response.blob();
    };

    setBlobUrl(null);
    void loadBlob()
      .then((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setBlobUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [agentId, filePath]);

  return blobUrl;
}
