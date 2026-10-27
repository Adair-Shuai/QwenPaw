/** Per-viewer CPU worker. All network I/O stays on the host-scoped API client. */
import { COLORMAPS } from "../rendering/colormaps";
import {
  computeScalarColors,
  type ScalarColorResult,
} from "../rendering/scalarColors";
import type { ScalarAssociation } from "../rendering/datasetGeometry";

export class WorkerManager {
  private worker: Worker | null = null;
  private workerUrl: string | null = null;
  private pending = new Map<
    string,
    {
      resolve: (value: ScalarColorResult | null) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private msgId = 0;

  constructor() {
    try {
      const workerCode = `
        const palettes = ${JSON.stringify(COLORMAPS)};
        const compute = ${computeScalarColors.toString()};
        self.onmessage = function(event) {
          const msg = event.data;
          try {
            const scalars = msg.isFloat ? new Float32Array(msg.scalars) : new Uint32Array(msg.scalars);
            const result = compute(scalars, new Uint32Array(msg.indices), msg.colormap, msg.nVerts, msg.association, palettes);
            self.postMessage({ id: msg.id, result }, [result.colors.buffer]);
          } catch (error) { self.postMessage({ id: msg.id, error: String(error) }); }
        };
      `;
      this.workerUrl = URL.createObjectURL(
        new Blob([workerCode], { type: "application/javascript" }),
      );
      this.worker = new Worker(this.workerUrl);
      this.worker.onmessage = (event: MessageEvent) => {
        const pending = this.pending.get(event.data.id);
        if (!pending) return;
        clearTimeout(pending.timer);
        this.pending.delete(event.data.id);
        pending.resolve(event.data.error ? null : event.data.result);
      };
      // Worker crashes used to leave loads waiting forever, preventing fallback.
      this.worker.onerror = () => this.dispose();
      this.worker.onmessageerror = () => this.dispose();
    } catch {
      this.dispose();
    }
  }

  isAvailable(): boolean {
    return this.worker !== null;
  }

  computeColors(
    scalars: ArrayBuffer,
    indices: ArrayBuffer,
    colormap: string,
    nVerts: number,
    isFloat: boolean,
    association: ScalarAssociation = "cell",
  ): Promise<ScalarColorResult | null> {
    if (!this.worker) return Promise.resolve(null);
    return new Promise((resolve) => {
      const id = `colors-${this.msgId++}`;
      const timer = setTimeout(() => this.dispose(), 30_000);
      this.pending.set(id, { resolve, timer });
      try {
        this.worker!.postMessage(
          { id, scalars, indices, colormap, nVerts, isFloat, association },
          [scalars, indices],
        );
      } catch {
        clearTimeout(timer);
        this.pending.delete(id);
        resolve(null);
      }
    });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    if (this.workerUrl) URL.revokeObjectURL(this.workerUrl);
    this.workerUrl = null;
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.resolve(null);
    }
    this.pending.clear();
  }
}
