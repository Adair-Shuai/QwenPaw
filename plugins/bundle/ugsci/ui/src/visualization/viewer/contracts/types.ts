/**
 * Frontend type contracts — shared between bootstrap and viewer runtime.
 *
 * These interfaces match the backend's data protocol and are used by
 * the API client, stores, and engines. They MUST stay in sync with:
 * - backend/api.py (response shapes)
 * - backend/readers/*.py (dataset manifest)
 * - contracts/dataset-manifest.schema.json
 */

// ─── Dataset Manifest ─────────────────────────────────────────────────────

export interface DatasetManifest {
  version: number;
  datasets: DatasetInfo[];
}

export interface DatasetInfo {
  id: string;
  name: string;
  n_vertices: number;
  n_cells: number;
  n_indices: number;
  grid_dims?: number[];
  source?: string;
  files: DatasetFiles;
  time_steps?: TimeStepInfo[];
  metadata?: Record<string, unknown>;
}

export interface TimeStepInfo {
  index: number;
  step_number: number;
  scalars: Record<string, string>;
}

export interface DatasetFiles {
  positions: string;
  indices: string;
  cell_ids: string;
  scalars: Record<string, string>;
}

// ─── Resource Descriptor (matches Section 5.3) ─────────────────────────────

export interface ResourceDescriptor {
  id: string;
  role: string;
  url: string;
  mediaType: "application/octet-stream" | "application/vnd.apache.arrow.stream";
  encoding: "raw" | "arrow";
  compression?: "none" | "zstd";
  dtype?: "float32" | "float64" | "uint32" | "int32" | "uint8";
  shape?: number[];
  byteOrder?: "little";
  byteLength: number;
  sha256: string;
  objectId?: string;
  propertyName?: string;
  timeStep?: number;
  chunk?: { index: number; count: number };
}

// ─── Viewer State (matches Section 7.3) ────────────────────────────────────

export type ViewType =
  | "reservoir"
  | "wellbore"
  | "intersection"
  | "welllog"
  | "network"
  | "benchmark";

export interface ViewerState {
  dataset: DatasetInfo | null;
  activeView: ViewType;
  selected: DomainSelection | null;
  visibleObjectIds: Set<string>;
  property: PropertySelection | null;
  timeStep: number;
  filters: DomainFilter[];
  colorMap: ColorMapConfig;
  loading: LoadingState;
  metrics: RendererMetrics;
}

export interface DomainSelection {
  type: "cell" | "well" | "segment" | "surface";
  id: string;
  ijk?: [number, number, number];
  coordinates?: [number, number, number];
}

export interface PropertySelection {
  name: string;
  displayName: string;
  range: [number, number];
}

export interface DomainFilter {
  type: "ijk" | "region" | "property-range" | "actnum";
  enabled: boolean;
  values?: (number | string)[];
  min?: number;
  max?: number;
}

export interface ColorMapConfig {
  name: string;
  inverted: boolean;
  range: [number, number];
}

export interface LoadingState {
  stage: string;
  progress: number; // 0.0 to 1.0
  error: string | null;
}

export interface RendererMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  jsHeapMB: number;
}

// ─── Import Job ─────────────────────────────────────────────────────────────

export interface ImportJob {
  job_id: string;
  name: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  current_stage: string;
  progress: number;
  error: string | null;
  stages: JobStage[];
  result: DatasetInfo | null;
}

export interface JobStage {
  name: string;
  status: string;
  duration: number;
}

// ─── SSE Events ────────────────────────────────────────────────────────────

export interface SSEEvent {
  type: "created" | "started" | "stage" | "completed" | "failed" | "cancelled" | "done";
  data: Record<string, unknown>;
  ts: number;
}

// ─── Capabilities ───────────────────────────────────────────────────────────

export interface Capabilities {
  synthetic: boolean;
  las: boolean;
  dlis: boolean;
  roff: boolean;
  eclipse: boolean;
  segy: boolean;
  arrow: boolean;
}

/** Runtime boundary shared by the bootstrap, workspace renderer and engines. */
export interface ViewerMountOptions {
  apiBase: string;
  authToken?: string;
}

export interface ViewerHandle {
  update(options: Partial<ViewerMountOptions>): void;
  executeCommand?(command: string, args: Record<string, unknown>): Promise<unknown>;
  dispose(): void | Promise<void>;
}
