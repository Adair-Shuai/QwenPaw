import type { RunEvent, RunNodeDetail } from "./RunInspector";

/** Public, credential-redacted observations from a fixed workflow revision. */
export interface RunRecord {
  run_id: string;
  flow_id: string;
  status: string;
  node_statuses: Record<string, string>;
  outputs: Record<string, unknown>;
  errors: unknown[];
  error?: string;
  started_at: number;
  finished_at?: number | null;
  duration_ms: number;
  flow_revision?: number;
  agent_id?: string;
  user_id?: string;
  inputs?: Record<string, unknown>;
  resumed_by_run_id?: string;
  parent_run_id?: string;
  root_run_id?: string;
  resumed_from_run_id?: string;
  node_details?: Record<string, RunNodeDetail>;
  events?: RunEvent[];
  trigger_type?: string;
  debug?: {
    mode: "node" | "until";
    target_node_id: string;
    pinned_node_ids?: string[];
    source_revision?: number;
  };
}
