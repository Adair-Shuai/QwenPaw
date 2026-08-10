import type { ViewerMountOptions } from "../contracts/types";

/**
 * Base rendering engine interface.
 *
 * All engines (Three.js, Webviz, videx, etc.) must implement this
 * interface so the mount module can swap them at runtime.
 */

export interface EngineMountOptions extends ViewerMountOptions {
  container: HTMLElement;
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
  executeCommand?(command: string, args: Record<string, unknown>): Promise<unknown>;
  update?(options: Partial<ViewerMountOptions>): void;
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
