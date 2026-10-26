import { COLORMAPS } from "./colormaps";
import type { ScalarAssociation } from "./datasetGeometry";

export interface ScalarColorResult { colors: Float32Array; smin: number; smax: number; validCount: number }

/** Pure implementation shared verbatim with the worker to keep both paths identical. */
export function computeScalarColors(
  scalars: Float32Array | Uint32Array,
  indices: Uint32Array,
  colormap: string,
  vertexCount: number,
  association: ScalarAssociation = "cell",
  palettes: Record<string, number[][]> = COLORMAPS,
): ScalarColorResult {
  if (!Number.isSafeInteger(vertexCount) || vertexCount <= 0 || !scalars.length) throw new Error("属性数据为空或顶点数量无效");
  if (association === "point" && scalars.length !== vertexCount) throw new Error("点属性数量与顶点数量不一致");
  if (association === "cell" && (!indices.length || indices.length % scalars.length !== 0)) throw new Error("单元属性数量与网格拓扑不一致");
  const palette = palettes[colormap] || palettes.viridis;
  let smin = Infinity, smax = -Infinity, validCount = 0;
  for (const value of scalars) {
    if (!Number.isFinite(value)) continue;
    smin = Math.min(smin, value);
    smax = Math.max(smax, value);
    validCount++;
  }
  if (!validCount) { smin = 0; smax = 1; }
  const range = smax - smin || 1;
  const colors = new Float32Array(vertexCount * 3);
  const counts = new Uint32Array(vertexCount);
  const perCell = association === "point" ? 1 : indices.length / scalars.length;
  for (let cell = 0; cell < scalars.length; cell++) {
    if (!Number.isFinite(scalars[cell])) continue;
    const position = Math.max(0, Math.min(1, (scalars[cell] - smin) / range)) * (palette.length - 1);
    const start = Math.floor(position), end = Math.min(palette.length - 1, start + 1), weight = position - start;
    for (let offset = 0; offset < perCell; offset++) {
      const vertex = association === "point" ? cell : indices[cell * perCell + offset];
      if (vertex >= vertexCount) throw new Error("属性拓扑索引超出顶点范围");
      for (let channel = 0; channel < 3; channel++) {
        colors[vertex * 3 + channel] += palette[start][channel] + (palette[end][channel] - palette[start][channel]) * weight;
      }
      counts[vertex]++;
    }
  }
  for (let vertex = 0; vertex < vertexCount; vertex++) {
    for (let channel = 0; channel < 3; channel++) {
      // Missing values are neutral gray, never fabricated zeros or NaN colors.
      colors[vertex * 3 + channel] = counts[vertex] ? colors[vertex * 3 + channel] / counts[vertex] : 0.45;
    }
  }
  return { colors, smin, smax, validCount };
}
