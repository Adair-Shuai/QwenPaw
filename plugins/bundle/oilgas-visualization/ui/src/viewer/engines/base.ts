/**
 * Base rendering engine interface.
 *
 * All engines (Three.js, Webviz, videx, etc.) must implement this
 * interface so the mount module can swap them at runtime.
 */

export interface EngineMountOptions {
  container: HTMLElement;
  apiBase: string;
  authToken?: string;
}

export interface EngineHandle {
  loadDataset(datasetId: string): Promise<void>;
  setProperty(name: string): void;
  setColorMap(name: string): void;
  setOpacity(value: number): void;
  setWireframe(enabled: boolean): void;
  setView(view: string): void;
  focusObject(objectType: string, id: string): void;
  captureScreenshot(): string | null;
  runBenchmark(): Promise<BenchmarkResult>;
  dispose(): void;
}

export interface BenchmarkResult {
  datasetId: string;
  p50: number;
  p95: number;
  p99: number;
  fps: number;
  drawCalls: number;
  triangles: number;
  jsHeapMB: number;
  duration: number;
}

export interface RenderingEngine {
  id: string;
  name: string;
  create(options: EngineMountOptions): EngineHandle;
}
