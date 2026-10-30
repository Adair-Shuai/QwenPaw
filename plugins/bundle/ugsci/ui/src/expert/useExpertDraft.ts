import { getHost } from "../core/runtime";

/** Existing tabs retain their own API/save boundaries and mounted drafts. */
export function useExpertDraft(
  loading: boolean,
  values: unknown,
  onDirtyChange?: (dirty: boolean) => void,
) {
  const { useRef, useEffect } = getHost().React;
  const baseline = useRef<string | null>(null);
  const encoded = JSON.stringify(values);
  useEffect(() => {
    if (loading) return;
    if (baseline.current === null) baseline.current = encoded;
    onDirtyChange?.(baseline.current !== encoded);
  }, [loading, encoded, onDirtyChange]);
  return () => {
    baseline.current = encoded;
    onDirtyChange?.(false);
  };
}
