/** VTK hexahedron topology, Eclipse pairing-order repair, and OPM fill.

xtgeo/Eclipse stores 8 corners as SW,SE,NW,NE per layer.  VTK (and this
viewer) expects cyclic winding.  Applying VTK faces to pairing-order
corners produces hourglass triangles instead of structured cells.

Corner-point faces are often non-planar.  A 2-triangle diagonal split
puts a crease on that diagonal (the origami look).  OPM's
`compute_face_geometry_3d` (opm-grid geometry.c) fans four triangles
from the average of the face nodes.  Fill tessellation matches that and
assigns one area-weighted normal per logical quad so lighting does not
show the fan.
*/

export const XTGEO_TO_VTK = [0, 1, 3, 2, 4, 5, 7, 6] as const;

export const VTK_HEX_FACES: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 1, 2, 3],
  [4, 7, 6, 5],
  [0, 1, 5, 4],
  [3, 2, 6, 7],
  [0, 3, 7, 4],
  [1, 2, 6, 5],
];

export const VTK_HEX_EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

export const HEX_CORNERS_PER_CELL = 8;
export const HEX_FILL_VERTS_PER_FACE = 5;
export const HEX_FILL_VERTS_PER_CELL = 6 * HEX_FILL_VERTS_PER_FACE;
export const HEX_FILL_INDICES_PER_CELL = 6 * 4 * 3;
export const HEX_COMPACT_VERTS_PER_CELL = 8 + 6;

function vertex(
  positions: Float32Array,
  cellIndex: number,
  corner: number,
): [number, number, number] {
  const offset = (cellIndex * 8 + corner) * 3;
  return [positions[offset], positions[offset + 1], positions[offset + 2]];
}

function normalAgreement(
  positions: Float32Array,
  cellIndex: number,
  face: readonly [number, number, number, number],
): number {
  const a = vertex(positions, cellIndex, face[0]);
  const b = vertex(positions, cellIndex, face[1]);
  const c = vertex(positions, cellIndex, face[2]);
  const d = vertex(positions, cellIndex, face[3]);
  const n1 = [
    (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
    (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
  ];
  const n2 = [
    (c[1] - a[1]) * (d[2] - a[2]) - (c[2] - a[2]) * (d[1] - a[1]),
    (c[2] - a[2]) * (d[0] - a[0]) - (c[0] - a[0]) * (d[2] - a[2]),
    (c[0] - a[0]) * (d[1] - a[1]) - (c[1] - a[1]) * (d[0] - a[0]),
  ];
  const len1 = Math.hypot(n1[0], n1[1], n1[2]);
  const len2 = Math.hypot(n2[0], n2[1], n2[2]);
  if (len1 === 0 || len2 === 0) return 0;
  return (n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]) / (len1 * len2);
}

export function hexVertsPerCell(vertexCount: number, cellCount: number): number {
  if (cellCount <= 0 || vertexCount % cellCount !== 0) return 0;
  return vertexCount / cellCount;
}

export function isHexCornerMesh(vertexCount: number, cellCount: number): boolean {
  const vertsPerCell = hexVertsPerCell(vertexCount, cellCount);
  return vertsPerCell === HEX_CORNERS_PER_CELL || vertsPerCell === HEX_COMPACT_VERTS_PER_CELL;
}

export function isHexCellMesh(vertexCount: number, cellCount: number): boolean {
  const vertsPerCell = hexVertsPerCell(vertexCount, cellCount);
  return (
    vertsPerCell === HEX_CORNERS_PER_CELL
    || vertsPerCell === HEX_COMPACT_VERTS_PER_CELL
    || vertsPerCell === HEX_FILL_VERTS_PER_CELL
  );
}

export function extractHexCorners(positions: Float32Array, cellCount: number): Float32Array {
  const vertsPerCell = hexVertsPerCell(positions.length / 3, cellCount);
  if (vertsPerCell === HEX_CORNERS_PER_CELL) {
    return new Float32Array(positions.subarray(0, cellCount * 24));
  }
  if (vertsPerCell !== HEX_COMPACT_VERTS_PER_CELL) {
    throw new Error("hex corners require 8 or 14 vertices per cell");
  }
  const corners = new Float32Array(cellCount * 24);
  for (let cell = 0; cell < cellCount; cell++) {
    const source = cell * HEX_COMPACT_VERTS_PER_CELL * 3;
    corners.set(positions.subarray(source, source + 24), cell * 24);
  }
  return corners;
}

export function prepareHexView(
  positions: Float32Array,
  cellCount: number,
): { corners: Float32Array; fill: ReturnType<typeof tessellateHexOpmFan>; remapped: boolean } | null {
  if (!isHexCornerMesh(positions.length / 3, cellCount)) return null;
  const corners = extractHexCorners(positions, cellCount);
  const remapped = maybeRemapHexPositions(corners, cellCount);
  return { corners, fill: tessellateHexOpmFan(corners, cellCount), remapped };
}

export function usesEclipsePairing(positions: Float32Array, cellCount: number): boolean {
  if (!isHexCornerMesh(positions.length / 3, cellCount)) return false;
  const corners = hexVertsPerCell(positions.length / 3, cellCount) === HEX_CORNERS_PER_CELL
    ? positions
    : extractHexCorners(positions, cellCount);
  const sample = Math.min(cellCount, 32);
  let vtkScore = 0;
  let eclipseScore = 0;
  for (let cell = 0; cell < sample; cell++) {
    vtkScore += normalAgreement(corners, cell, [0, 1, 2, 3]);
    eclipseScore += normalAgreement(corners, cell, [0, 1, 3, 2]);
  }
  return eclipseScore > vtkScore + 0.25 * sample;
}

/** Reorder pairing-order corners in place to VTK hexahedron winding. */
export function remapEclipsePairingInPlace(positions: Float32Array, cellCount: number): void {
  const tmp = new Float32Array(24);
  for (let cell = 0; cell < cellCount; cell++) {
    const base = cell * 24;
    tmp.set(positions.subarray(base, base + 24));
    for (let vtk = 0; vtk < 8; vtk++) {
      const src = XTGEO_TO_VTK[vtk] * 3;
      const dst = base + vtk * 3;
      positions[dst] = tmp[src];
      positions[dst + 1] = tmp[src + 1];
      positions[dst + 2] = tmp[src + 2];
    }
  }
}

export function maybeRemapHexPositions(positions: Float32Array, cellCount: number): boolean {
  if (!usesEclipsePairing(positions, cellCount)) return false;
  const vertsPerCell = hexVertsPerCell(positions.length / 3, cellCount);
  if (vertsPerCell === HEX_CORNERS_PER_CELL) {
    remapEclipsePairingInPlace(positions, cellCount);
    return true;
  }
  const tmp = new Float32Array(24);
  for (let cell = 0; cell < cellCount; cell++) {
    const base = cell * HEX_COMPACT_VERTS_PER_CELL * 3;
    tmp.set(positions.subarray(base, base + 24));
    for (let vtk = 0; vtk < 8; vtk++) {
      const src = XTGEO_TO_VTK[vtk] * 3;
      const dst = base + vtk * 3;
      positions[dst] = tmp[src];
      positions[dst + 1] = tmp[src + 1];
      positions[dst + 2] = tmp[src + 2];
    }
  }
  return true;
}

export function tessellateHexOpmFan(
  corners: Float32Array,
  cellCount: number,
): { positions: Float32Array; indices: Uint32Array; normals: Float32Array } {
  if (hexVertsPerCell(corners.length / 3, cellCount) !== HEX_CORNERS_PER_CELL) {
    throw new Error("OPM hex fan requires 8 corners per cell");
  }
  const positions = new Float32Array(cellCount * HEX_FILL_VERTS_PER_CELL * 3);
  const normals = new Float32Array(cellCount * HEX_FILL_VERTS_PER_CELL * 3);
  const indices = new Uint32Array(cellCount * HEX_FILL_INDICES_PER_CELL);
  let pCursor = 0;
  let nCursor = 0;
  let iCursor = 0;
  for (let cell = 0; cell < cellCount; cell++) {
    const cornerBase = cell * 24;
    const vertBase = cell * HEX_FILL_VERTS_PER_CELL;
    for (let faceIndex = 0; faceIndex < VTK_HEX_FACES.length; faceIndex++) {
      const face = VTK_HEX_FACES[faceIndex];
      const ax = corners[cornerBase + face[0] * 3];
      const ay = corners[cornerBase + face[0] * 3 + 1];
      const az = corners[cornerBase + face[0] * 3 + 2];
      const bx = corners[cornerBase + face[1] * 3];
      const by = corners[cornerBase + face[1] * 3 + 1];
      const bz = corners[cornerBase + face[1] * 3 + 2];
      const cx = corners[cornerBase + face[2] * 3];
      const cy = corners[cornerBase + face[2] * 3 + 1];
      const cz = corners[cornerBase + face[2] * 3 + 2];
      const dx = corners[cornerBase + face[3] * 3];
      const dy = corners[cornerBase + face[3] * 3 + 1];
      const dz = corners[cornerBase + face[3] * 3 + 2];
      const mx = (ax + bx + cx + dx) * 0.25;
      const my = (ay + by + cy + dy) * 0.25;
      const mz = (az + bz + cz + dz) * 0.25;
      let ux = dx - mx;
      let uy = dy - my;
      let uz = dz - mz;
      let nx = 0;
      let ny = 0;
      let nz = 0;
      const ringX = [ax, bx, cx, dx];
      const ringY = [ay, by, cy, dy];
      const ringZ = [az, bz, cz, dz];
      for (let node = 0; node < 4; node++) {
        const vx = ringX[node] - mx;
        const vy = ringY[node] - my;
        const vz = ringZ[node] - mz;
        nx += uy * vz - uz * vy;
        ny += uz * vx - ux * vz;
        nz += ux * vy - uy * vx;
        ux = vx;
        uy = vy;
        uz = vz;
      }
      const nlen = Math.hypot(nx, ny, nz);
      if (nlen === 0) {
        nx = 0;
        ny = 0;
        nz = 1;
      } else {
        nx /= nlen;
        ny /= nlen;
        nz /= nlen;
      }
      const ptsX = [ax, bx, cx, dx, mx];
      const ptsY = [ay, by, cy, dy, my];
      const ptsZ = [az, bz, cz, dz, mz];
      for (let point = 0; point < 5; point++) {
        positions[pCursor++] = ptsX[point];
        positions[pCursor++] = ptsY[point];
        positions[pCursor++] = ptsZ[point];
        normals[nCursor++] = nx;
        normals[nCursor++] = ny;
        normals[nCursor++] = nz;
      }
      const faceVert = vertBase + faceIndex * HEX_FILL_VERTS_PER_FACE;
      const midpoint = faceVert + 4;
      indices[iCursor++] = midpoint;
      indices[iCursor++] = faceVert;
      indices[iCursor++] = faceVert + 1;
      indices[iCursor++] = midpoint;
      indices[iCursor++] = faceVert + 1;
      indices[iCursor++] = faceVert + 2;
      indices[iCursor++] = midpoint;
      indices[iCursor++] = faceVert + 2;
      indices[iCursor++] = faceVert + 3;
      indices[iCursor++] = midpoint;
      indices[iCursor++] = faceVert + 3;
      indices[iCursor++] = faceVert;
    }
  }
  return { positions, indices, normals };
}

export function buildHexEdgeIndex(cellOffsets: Iterable<number>): Uint32Array {
  const offsets = Array.from(cellOffsets);
  const index = new Uint32Array(offsets.length * VTK_HEX_EDGES.length * 2);
  let cursor = 0;
  for (const cell of offsets) {
    const base = cell * HEX_CORNERS_PER_CELL;
    for (const [a, b] of VTK_HEX_EDGES) {
      index[cursor++] = base + a;
      index[cursor++] = base + b;
    }
  }
  return index;
}
