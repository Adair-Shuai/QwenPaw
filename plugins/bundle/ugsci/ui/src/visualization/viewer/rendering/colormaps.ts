/** Color-map definitions shared by the main renderer and decode worker. */

export const COLORMAPS: Record<string, number[][]> = {
  viridis: [
    [0.267, 0.005, 0.329],
    [0.282, 0.14, 0.457],
    [0.254, 0.265, 0.53],
    [0.207, 0.372, 0.553],
    [0.164, 0.471, 0.558],
    [0.138, 0.567, 0.55],
    [0.135, 0.659, 0.518],
    [0.157, 0.745, 0.467],
    [0.215, 0.813, 0.398],
    [0.35, 0.851, 0.333],
    [0.536, 0.851, 0.261],
    [0.737, 0.813, 0.185],
    [0.921, 0.737, 0.089],
    [0.993, 0.906, 0.144],
  ],
  plasma: [
    [0.051, 0.028, 0.528],
    [0.184, 0.039, 0.606],
    [0.31, 0.02, 0.653],
    [0.431, 0.004, 0.678],
    [0.55, 0.02, 0.682],
    [0.665, 0.058, 0.662],
    [0.773, 0.137, 0.616],
    [0.867, 0.249, 0.541],
    [0.937, 0.379, 0.448],
    [0.98, 0.516, 0.345],
    [0.993, 0.651, 0.25],
    [0.969, 0.772, 0.169],
    [0.921, 0.873, 0.102],
    [0.886, 0.961, 0.09],
  ],
  turbo: [
    [0.189, 0.0, 0.381],
    [0.34, 0.06, 0.59],
    [0.47, 0.08, 0.87],
    [0.53, 0.22, 0.93],
    [0.55, 0.34, 0.97],
    [0.56, 0.45, 0.96],
    [0.57, 0.55, 0.94],
    [0.59, 0.65, 0.9],
    [0.62, 0.73, 0.83],
    [0.68, 0.8, 0.74],
    [0.77, 0.86, 0.62],
    [0.87, 0.91, 0.48],
    [0.98, 0.95, 0.33],
    [0.99, 0.98, 0.15],
  ],
  rainbow: [
    [0.0, 0.0, 0.515],
    [0.0, 0.0, 1.0],
    [0.0, 1.0, 1.0],
    [0.0, 1.0, 0.0],
    [1.0, 1.0, 0.0],
    [1.0, 0.0, 0.0],
    [0.5, 0.0, 0.0],
  ],
  gray: [
    [0.1, 0.1, 0.1],
    [0.3, 0.3, 0.3],
    [0.5, 0.5, 0.5],
    [0.7, 0.7, 0.7],
    [0.9, 0.9, 0.9],
  ],
};

export const COLORMAP_NAMES = Object.keys(COLORMAPS);

export function sampleColormap(
  name: string,
  t: number,
): [number, number, number] {
  const cm = COLORMAPS[name] || COLORMAPS.viridis;
  const normalized = Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0;
  const position = normalized * (cm.length - 1);
  const index = Math.floor(position);
  const next = Math.min(cm.length - 1, index + 1);
  const fraction = position - index;
  return [
    cm[index][0] + (cm[next][0] - cm[index][0]) * fraction,
    cm[index][1] + (cm[next][1] - cm[index][1]) * fraction,
    cm[index][2] + (cm[next][2] - cm[index][2]) * fraction,
  ];
}

export function colormapCssGradient(name: string): string {
  const cm = COLORMAPS[name] || COLORMAPS.viridis;
  const stops = cm.map((color, index) => {
    const pct = (index / Math.max(cm.length - 1, 1)) * 100;
    const r = Math.round(color[0] * 255);
    const g = Math.round(color[1] * 255);
    const b = Math.round(color[2] * 255);
    return "rgb(" + r + "," + g + "," + b + ") " + pct + "%";
  });
  return "linear-gradient(90deg," + stops.join(",") + ")";
}
