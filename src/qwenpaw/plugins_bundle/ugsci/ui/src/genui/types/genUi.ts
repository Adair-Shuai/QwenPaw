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

export interface GenUiTreeResult {
  ok: boolean;
  kind: "genui" | "genui_error" | "genui_patch";
  schema_version?: string;
  ui_id?: string;
  revision?: number;
  tree?: GenUiTreeV1;
  error_code?: string;
  message?: string;
  hint?: string;
  base_revision?: number;
  patches?: GenUiPatchOp[];
  tool_call_id?: string;
}

export interface GenUiPatchOp {
  op: "replace" | "add" | "remove";
  path: string;
  value?: unknown;
}

export interface GenUiPatchPayload {
  ui_id: string;
  base_revision: number;
  patches: GenUiPatchOp[];
}

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
