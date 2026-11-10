export type ContextInspectorSourceKind =
  | "attachment"
  | "quote"
  | "rule"
  | "memory"
  | "message"
  | "other";

/** Status comes from the composer or the recorded request, never a directory scan. */
export interface ContextInspectorSource {
  id: string;
  kind: ContextInspectorSourceKind;
  title: string;
  detail?: string;
  content?: string;
  status?: "included" | "pending" | "unknown" | "accessible";
  removable?: boolean;
}

export interface ContextInspectorDetails {
  sources: ContextInspectorSource[];
  summary?: { content: string; updatedAt?: string; notice?: string } | null;
  summaryAvailable?: boolean;
  notice?: string;
}

export interface ContextInspectorProps {
  scopeKey?: string;
  draftSources?: ContextInspectorSource[];
  details?: ContextInspectorDetails | null;
  detailsLoading?: boolean;
  detailsError?: string;
  onInspect?: () => void;
  onOpenChange?: (open: boolean) => void;
  onRetry?: () => void;
  onRemoveSource?: (id: string) => void;
  removedSource?: { id: string; title: string } | null;
  onUndoRemove?: () => void;
  executionBusy?: boolean;
}
