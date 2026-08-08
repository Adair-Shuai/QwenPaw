/**
 * GenUI type definitions — mirrors the backend schema.py wire format.
 *
 * Ported from LeAgent frontend/src/types/genUi.ts (Apache-2.0).
 * Adapted: simplified to phase-1 component set.
 */

export interface GenUiNode {
  nodeId: string;
  kind: string;
  props?: Record<string, unknown>;
  children?: GenUiNode[];
}

export interface GenUiTreeV1 {
  schemaVersion: "1";
  root: GenUiNode;
}

/** Success result from emit_ui_tree tool. */
export interface GenUiTreeResult {
  ok: boolean;
  kind: "genui" | "genui_error";
  schema_version?: string;
  ui_id?: string;
  revision?: number;
  tree?: GenUiTreeV1;
  error_code?: string;
  message?: string;
  hint?: string;
}

/** Snapshot stored in the GenUI store. */
export interface GenUiSnapshot {
  schemaVersion: "1";
  uiId: string;
  revision: number;
  tree: GenUiTreeV1;
  sessionId: string;
  messageId?: string;
  sourceToolCallId?: string;
  updatedAt: number;
}

/** Patch payload (phase-2). */
export interface UiPatchPayload {
  ok: boolean;
  kind: "genui_patch";
  ui_id: string;
  base_revision: number;
  revision: number;
  patches: Array<{ op: string; path: string; value?: unknown }>;
  tree: GenUiTreeV1;
}
