/** Binary-resource and scalar-color worker lifecycle. */

import { COLORMAPS } from "../rendering/colormaps";

type ColorResult = { colors: Float32Array; smin: number; smax: number };

export class WorkerManager {
  private worker: Worker | null = null;
  private workerUrl: string | null = null;
  private pending = new Map<string, (data: Float32Array | null) => void>();
  private pendingColors = new Map<string, (data: ColorResult | null) => void>();
  private msgId = 0;

  constructor() {
    try {
      const workerCode = `
        const colormaps = ${JSON.stringify(COLORMAPS)};
        function colormap(name, t) {
          const cm = colormaps[name] || colormaps.viridis;
          const idx = Math.max(0, Math.min(cm.length-1, Math.floor(t*(cm.length-1))));
          const next = Math.min(cm.length-1, idx+1);
          const frac = t*(cm.length-1)-idx;
          return [cm[idx][0]+(cm[next][0]-cm[idx][0])*frac, cm[idx][1]+(cm[next][1]-cm[idx][1])*frac, cm[idx][2]+(cm[next][2]-cm[idx][2])*frac];
        }
        self.onmessage = async function(e) {
          const msg = e.data;
          if (msg.type === "decode") {
            try {
              const resp = await fetch(msg.url, { headers: msg.authToken ? {Authorization:"Bearer "+msg.authToken} : {} });
              if (!resp.ok) { self.postMessage({type:"error",id:msg.id,error:"HTTP "+resp.status}); return; }
              const buf = await resp.arrayBuffer();
              self.postMessage({type:"decoded",id:msg.id,buffer:buf}, [buf]);
            } catch(err) { self.postMessage({type:"error",id:msg.id,error:String(err)}); }
          } else if (msg.type === "compute-colors") {
            const scalars = msg.isFloat ? new Float32Array(msg.scalars) : new Uint32Array(msg.scalars);
            const indices = new Uint32Array(msg.indices);
            let smin=Infinity, smax=-Infinity;
            for (let i=0; i<scalars.length; i++) { if(scalars[i]<smin)smin=scalars[i]; if(scalars[i]>smax)smax=scalars[i]; }
            const srange = smax-smin || 1;
            const colors = new Float32Array(msg.nVerts*3);
            const vCount = new Float32Array(msg.nVerts);
            const ipc = indices.length / scalars.length;
            for (let c=0; c<scalars.length; c++) {
              const [r,g,b] = colormap(msg.colormap, (scalars[c]-smin)/srange);
              const start = c*ipc;
              for (let k=0; k<ipc; k++) { const vi=indices[start+k]; if(vi<msg.nVerts){colors[vi*3]+=r;colors[vi*3+1]+=g;colors[vi*3+2]+=b;vCount[vi]++;} }
            }
            for (let i=0; i<msg.nVerts; i++) { const count=vCount[i]||1; colors[i*3]/=count; colors[i*3+1]/=count; colors[i*3+2]/=count; }
            self.postMessage({type:"colors",id:msg.id,colors,smin,smax}, [colors.buffer]);
          }
        };
      `;
      const blob = new Blob([workerCode], { type: "application/javascript" });
      this.workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(this.workerUrl);
      this.worker.onmessage = (event: MessageEvent) => {
        const message = event.data;
        if (message.type === "decoded") {
          this.pending.get(message.id)?.(new Float32Array(message.buffer));
          this.pending.delete(message.id);
        } else if (message.type === "colors") {
          this.pendingColors.get(message.id)?.({ colors: message.colors, smin: message.smin, smax: message.smax });
          this.pendingColors.delete(message.id);
        } else if (message.type === "error") {
          this.pending.get(message.id)?.(null);
          this.pendingColors.get(message.id)?.(null);
          this.pending.delete(message.id);
          this.pendingColors.delete(message.id);
        }
      };
    } catch (error) {
      console.warn("[oilgas-vis] Worker creation failed, falling back to main thread", error);
    }
  }

  isAvailable(): boolean { return this.worker !== null; }

  decode(url: string, authToken?: string): Promise<Float32Array | null> {
    if (!this.worker) return Promise.resolve(null);
    return new Promise((resolve) => {
      const id = `decode-${this.msgId++}`;
      this.pending.set(id, resolve);
      try {
        this.worker!.postMessage({ type: "decode", id, url, authToken });
      } catch {
        this.pending.delete(id);
        resolve(null);
      }
    });
  }

  computeColors(
    scalars: ArrayBuffer,
    indices: ArrayBuffer,
    colormap: string,
    nVerts: number,
    isFloat: boolean,
  ): Promise<ColorResult | null> {
    if (!this.worker) return Promise.resolve(null);
    return new Promise((resolve) => {
      const id = `colors-${this.msgId++}`;
      this.pendingColors.set(id, resolve);
      try {
        this.worker!.postMessage(
          { type: "compute-colors", id, scalars, indices, colormap, nVerts, isFloat },
          [scalars, indices],
        );
      } catch {
        this.pendingColors.delete(id);
        resolve(null);
      }
    });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    if (this.workerUrl) URL.revokeObjectURL(this.workerUrl);
    this.workerUrl = null;
    for (const resolve of this.pending.values()) resolve(null);
    for (const resolve of this.pendingColors.values()) resolve(null);
    this.pending.clear();
    this.pendingColors.clear();
  }
}
