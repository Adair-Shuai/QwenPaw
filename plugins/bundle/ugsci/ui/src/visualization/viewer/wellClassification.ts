/**
 * Well vs well-log classification for the native field view.
 *
 * Spatial wells may overlay the reservoir grid. Depth-only logs (LAS/DLIS
 * without a real XY, or a trajectory collapsed to the origin) stay on the
 * well-log view and must not be drawn as a stick at (0, 0, -MD).
 */

import type { DatasetInfo } from "./contracts/types";

export type WellPlacement = "spatial" | "depth-only";

/** Metres. Matches the backend trajectory_placement threshold. */
export const SPATIAL_XY_METERS = 1;

const WELL_SOURCES = new Set(["wellbore", "las", "dlis", "well", "trajectory"]);

export function isWellSource(source: string | undefined): boolean {
  return WELL_SOURCES.has(source || "");
}

export function trajectoryPlacement(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
): WellPlacement {
  if (x.length === 0 || y.length === 0 || x.length !== y.length) {
    return "depth-only";
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let maxAbs = 0;
  for (let index = 0; index < x.length; index++) {
    const east = x[index];
    const north = y[index];
    if (!Number.isFinite(east) || !Number.isFinite(north)) continue;
    minX = Math.min(minX, east);
    maxX = Math.max(maxX, east);
    minY = Math.min(minY, north);
    maxY = Math.max(maxY, north);
    maxAbs = Math.max(maxAbs, Math.abs(east), Math.abs(north));
  }
  if (!Number.isFinite(maxAbs)) return "depth-only";
  const span = Math.max(maxX - minX, maxY - minY);
  return maxAbs > SPATIAL_XY_METERS || span > SPATIAL_XY_METERS
    ? "spatial"
    : "depth-only";
}

export function wellPlacement(dataset: DatasetInfo): WellPlacement | null {
  if (!isWellSource(dataset.source)) return null;
  const meta = dataset.metadata || {};
  if (meta.placement === "spatial" || meta.spatial === true) return "spatial";
  if (meta.placement === "depth-only" || meta.spatial === false) return "depth-only";
  if (dataset.source === "las" || dataset.source === "dlis") return "depth-only";
  return "spatial";
}

export function isSpatialWell(dataset: DatasetInfo): boolean {
  return wellPlacement(dataset) === "spatial";
}

export function isDepthOnlyWell(dataset: DatasetInfo): boolean {
  return wellPlacement(dataset) === "depth-only";
}

const NON_GRID_SOURCES = new Set([
  "las",
  "dlis",
  "network",
  "network-tube",
  "wellbore",
  "well",
  "trajectory",
  "surface",
  "intersection",
  "well-intersection",
  "slice",
]);

export function isGridDataset(dataset: DatasetInfo): boolean {
  if (dataset.grid_dims && dataset.grid_dims.length >= 3) return true;
  return !NON_GRID_SOURCES.has(dataset.source || "");
}

export function wellDisplayName(dataset: DatasetInfo): string {
  const meta = dataset.metadata || {};
  if (typeof meta.well_name === "string" && meta.well_name.trim()) {
    return meta.well_name.trim();
  }
  return dataset.name.replace(/^Well:\s*/i, "").replace(/\s*\([^)]*\)\s*$/, "").trim()
    || dataset.id;
}

export function downsamplePolyline(
  points: Array<[number, number, number]>,
  maxPoints = 256,
): Array<[number, number, number]> {
  if (points.length <= maxPoints) return points;
  const last = points.length - 1;
  const out: Array<[number, number, number]> = [];
  for (let index = 0; index < maxPoints - 1; index++) {
    out.push(points[Math.round((index * last) / (maxPoints - 1))]);
  }
  out.push(points[last]);
  return out;
}

export function uniquePolyline(
  positions: ArrayLike<number>,
  minStep = 1e-4,
): Array<[number, number, number]> {
  const points: Array<[number, number, number]> = [];
  const minStepSq = minStep * minStep;
  for (let index = 0; index + 2 < positions.length; index += 3) {
    const point: [number, number, number] = [
      positions[index],
      positions[index + 1],
      positions[index + 2],
    ];
    if (!point.every(Number.isFinite)) continue;
    const previous = points[points.length - 1];
    if (!previous) {
      points.push(point);
      continue;
    }
    const dx = point[0] - previous[0];
    const dy = point[1] - previous[1];
    const dz = point[2] - previous[2];
    if (dx * dx + dy * dy + dz * dz > minStepSq) points.push(point);
  }
  return points;
}

export function visualWellRadius(points: Array<[number, number, number]>): number {
  if (points.length < 2) return 2;
  let length = 0;
  let minX = points[0][0];
  let maxX = points[0][0];
  let minY = points[0][1];
  let maxY = points[0][1];
  let minZ = points[0][2];
  let maxZ = points[0][2];
  for (let index = 1; index < points.length; index++) {
    const [x, y, z] = points[index];
    const [px, py, pz] = points[index - 1];
    const dx = x - px;
    const dy = y - py;
    const dz = z - pz;
    length += Math.sqrt(dx * dx + dy * dy + dz * dz);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ, length, 1);
  return Math.min(Math.max(extent * 0.004, 1.5), 80);
}
