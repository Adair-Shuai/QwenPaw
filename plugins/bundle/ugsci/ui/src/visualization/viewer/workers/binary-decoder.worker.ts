/**
 * Web Worker for binary data decoding and processing.
 *
 * The Worker is responsible for:
 * - Downloading and decoding binary resources (positions, indices, scalars)
 * - Computing property min/max/histogram
 * - Building color arrays from scalar values
 * - Spatial indexing for cell picking
 *
 * The main thread only handles React UI, scene submission, and user input.
 *
 * Communication protocol:
 *   Main → Worker: { type: "decode", filename, apiBase, authToken }
 *   Worker → Main: { type: "decoded", filename, buffer } (transferable)
 *   Main → Worker: { type: "compute-colors", scalars, indices, colormap, nVerts }
 *   Worker → Main: { type: "colors", buffer } (transferable)
 *   Main → Worker: { type: "histogram", scalars, bins }
 *   Worker → Main: { type: "histogram-result", bins, counts }
 */

/// <reference lib="webworker" />

const ctx = self as unknown as DedicatedWorkerGlobalScope;

// Colormaps (mirrored from viewer)
const colormaps: Record<string, number[][]> = {
  viridis: [
    [0.267, 0.005, 0.329], [0.282, 0.140, 0.457], [0.254, 0.265, 0.530],
    [0.207, 0.372, 0.553], [0.164, 0.471, 0.558], [0.138, 0.567, 0.550],
    [0.135, 0.659, 0.518], [0.157, 0.745, 0.467], [0.215, 0.813, 0.398],
    [0.350, 0.851, 0.333], [0.536, 0.851, 0.261], [0.737, 0.813, 0.185],
    [0.921, 0.737, 0.089], [0.993, 0.906, 0.144],
  ],
  plasma: [
    [0.051, 0.028, 0.528], [0.184, 0.039, 0.606], [0.310, 0.020, 0.653],
    [0.431, 0.004, 0.678], [0.550, 0.020, 0.682], [0.665, 0.058, 0.662],
    [0.773, 0.137, 0.616], [0.867, 0.249, 0.541], [0.937, 0.379, 0.448],
    [0.980, 0.516, 0.345], [0.993, 0.651, 0.250], [0.969, 0.772, 0.169],
    [0.921, 0.873, 0.102], [0.886, 0.961, 0.090],
  ],
  turbo: [
    [0.189, 0.000, 0.381], [0.340, 0.060, 0.590], [0.470, 0.080, 0.870],
    [0.530, 0.220, 0.930], [0.550, 0.340, 0.970], [0.560, 0.450, 0.960],
    [0.570, 0.550, 0.940], [0.590, 0.650, 0.900], [0.620, 0.730, 0.830],
    [0.680, 0.800, 0.740], [0.770, 0.860, 0.620], [0.870, 0.910, 0.480],
    [0.980, 0.950, 0.330], [0.990, 0.980, 0.150],
  ],
  gray: [
    [0.1, 0.1, 0.1], [0.3, 0.3, 0.3], [0.5, 0.5, 0.5],
    [0.7, 0.7, 0.7], [0.9, 0.9, 0.9],
  ],
};

function colormap(name: string, t: number): [number, number, number] {
  const cm = colormaps[name] || colormaps.viridis;
  const idx = Math.max(0, Math.min(cm.length - 1, Math.floor(t * (cm.length - 1))));
  const next = Math.min(cm.length - 1, idx + 1);
  const frac = t * (cm.length - 1) - idx;
  return [
    cm[idx][0] + (cm[next][0] - cm[idx][0]) * frac,
    cm[idx][1] + (cm[next][1] - cm[idx][1]) * frac,
    cm[idx][2] + (cm[next][2] - cm[idx][2]) * frac,
  ];
}

ctx.addEventListener("message", async (e: MessageEvent) => {
  const msg = e.data;

  switch (msg.type) {
    case "decode": {
      // Fetch binary data with auth headers
      const headers: Record<string, string> = msg.authToken
        ? { Authorization: `Bearer ${msg.authToken}` }
        : {};
      try {
        const resp = await fetch(`${msg.apiBase}/resource/${msg.filename}`, { headers });
        if (!resp.ok) {
          ctx.postMessage({ type: "error", error: `HTTP ${resp.status}`, filename: msg.filename });
          return;
        }
        const buffer = await resp.arrayBuffer();
        ctx.postMessage({ type: "decoded", filename: msg.filename, buffer }, [buffer]);
      } catch (err) {
        ctx.postMessage({ type: "error", error: String(err), filename: msg.filename });
      }
      break;
    }

    case "compute-colors": {
      // Compute vertex colors from cell scalars
      const { scalars, indices, colormapName, nVerts, isFloat } = msg;
      const scalarArray = isFloat
        ? new Float32Array(scalars)
        : new Uint32Array(scalars);

      let smin = Infinity, smax = -Infinity;
      for (let i = 0; i < scalarArray.length; i++) {
        const v = scalarArray[i];
        if (v < smin) smin = v;
        if (v > smax) smax = v;
      }
      const srange = smax - smin || 1;

      const colors = new Float32Array(nVerts * 3);
      const vCount = new Float32Array(nVerts);
      const indicesArray = new Uint32Array(indices);
      const indicesPerCell = indicesArray.length / scalarArray.length;

      for (let c = 0; c < scalarArray.length; c++) {
        const t = (scalarArray[c] - smin) / srange;
        const [r, g, b] = colormap(colormapName, t);
        const start = c * indicesPerCell;
        for (let k = 0; k < indicesPerCell; k++) {
          const vi = indicesArray[start + k];
          if (vi < nVerts) {
            colors[vi * 3] += r;
            colors[vi * 3 + 1] += g;
            colors[vi * 3 + 2] += b;
            vCount[vi]++;
          }
        }
      }
      for (let i = 0; i < nVerts; i++) {
        const cnt = vCount[i] || 1;
        colors[i * 3] /= cnt;
        colors[i * 3 + 1] /= cnt;
        colors[i * 3 + 2] /= cnt;
      }

      ctx.postMessage(
        { type: "colors", colors, smin, smax },
        [colors.buffer],
      );
      break;
    }

    case "histogram": {
      const { scalars, bins, isFloat } = msg;
      const arr = isFloat ? new Float32Array(scalars) : new Uint32Array(scalars);
      let smin = Infinity, smax = -Infinity;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] < smin) smin = arr[i];
        if (arr[i] > smax) smax = arr[i];
      }
      const range = smax - smin || 1;
      const counts = new Uint32Array(bins);
      for (let i = 0; i < arr.length; i++) {
        const bin = Math.min(bins - 1, Math.floor(((arr[i] - smin) / range) * bins));
        counts[bin]++;
      }
      ctx.postMessage({ type: "histogram-result", counts, smin, smax });
      break;
    }

    default:
      ctx.postMessage({ type: "error", error: `Unknown message type: ${msg.type}` });
  }
});

export {};
