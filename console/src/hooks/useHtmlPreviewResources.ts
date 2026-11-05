import { useEffect, useState } from "react";
import type { WorkspaceArtifact } from "../components/Workspace/types";
import {
  prepareHtmlPreviewResources,
  type HtmlPreviewResources,
} from "../utils/htmlPreviewResources";

export function useHtmlPreviewResources(artifact: WorkspaceArtifact) {
  const [result, setResult] = useState<{
    artifact: WorkspaceArtifact;
    value: HtmlPreviewResources;
  }>();
  const content = artifact.textContent ?? "";
  const needed = Boolean(
    artifact.workspacePath &&
      /<(?:link|img|script)\b[^>]*(?:href|src)\s*=/i.test(content),
  );
  useEffect(() => {
    if (!needed) return;
    const controller = new AbortController();
    void prepareHtmlPreviewResources(content, artifact, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setResult({ artifact, value });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            artifact,
            value: { content, missing: [artifact.title] },
          });
      });
    return () => controller.abort();
  }, [artifact, content, needed]);
  if (!needed) return { content, missing: [], loading: false };
  return result?.artifact === artifact
    ? { ...result.value, loading: false }
    : { content: "", missing: [], loading: true };
}
