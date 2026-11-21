import { arcPoints, arcRadius, curveSteps } from "./ezCurves.js";

// Sort source primitive indices by position so each GPU batch covers a compact
// part of the plant. A tube's actual endpoints still determine its culling box.
const morton = new Uint32Array(1024);
for (let i = 0; i < morton.length; i++) {
  for (let bit = 0; bit < 10; bit++) morton[i] |= ((i >> bit) & 1) << (3 * bit);
}
export function spatialOrder(rows, stride, kind, bounds) {
  const count = rows.length / stride,
    keys = new Uint32Array(count),
    order = new Uint32Array(count);
  const [lo, hi] = bounds;
  const factor = 1023 / (Math.max(...hi.map((v, i) => v - lo[i])) || 1);
  const part = (v, axis) =>
    morton[Math.max(0, Math.min(1023, Math.floor((v - lo[axis]) * factor)))];
  for (let n = 0, p = 0; n < count; n++, p += stride) {
    let x, y, z;
    if (kind === "face") {
      x = (rows[p] + rows[p + 3] + rows[p + 6]) / 3;
      y = (rows[p + 1] + rows[p + 4] + rows[p + 7]) / 3;
      z = (rows[p + 2] + rows[p + 5] + rows[p + 8]) / 3;
    } else if (kind === "arc") {
      x = rows[p + 2];
      y = rows[p + 3];
      z = rows[p + 4];
    } else {
      x = (rows[p + 2] + rows[p + 5]) / 2;
      y = (rows[p + 3] + rows[p + 6]) / 2;
      z = (rows[p + 4] + rows[p + 7]) / 2;
    }
    keys[n] = part(x, 0) | (part(y, 1) << 1) | (part(z, 2) << 2);
    order[n] = n;
  }
  return order.sort((a, b) => keys[a] - keys[b]);
}

// Vertices in the overview are original pipe ends, points sampled on a native
// bend, or points on a source surface. Group only subpixel details belonging
// to the same registered asset. Selection and picking retain the source IDs.
export function makeOverview(data, step) {
  const {
    tubeCoords: tubes,
    tubeOwners,
    faceCoords,
    faceOwners,
    arcCoords: arcs,
    arcOwners,
    arcExtents,
  } = data;
  const points = [],
    lines = [],
    faces = [],
    thickTubes = [],
    thickArcs = [];
  const [lo, hi] = data.bounds,
    cell = step / 2;
  const nx = 1 + Math.floor((hi[0] - lo[0]) / cell),
    ny = 1 + Math.floor((hi[1] - lo[1]) / cell);
  const seen = new Map();
  function dot(id, x, y, z) {
    let cells = seen.get(id);
    if (!cells) {
      cells = new Set();
      seen.set(id, cells);
    }
    const ix = Math.floor((x - lo[0]) / cell),
      iy = Math.floor((y - lo[1]) / cell),
      iz = Math.floor((z - lo[2]) / cell);
    const key = ix + nx * (iy + ny * iz);
    if (!cells.has(key)) {
      cells.add(key);
      points.push(x, y, z, id);
    }
  }
  for (let n = 0, p = 0; n < tubeOwners.length; n++, p += 9) {
    const id = tubeOwners[n],
      x = tubes[p + 2],
      y = tubes[p + 3],
      z = tubes[p + 4];
    const a = tubes[p + 5],
      b = tubes[p + 6],
      c = tubes[p + 7],
      r = tubes[p + 8];
    if (2 * r >= step) thickTubes.push(n);
    else if (Math.max(Math.abs(a - x), Math.abs(b - y), Math.abs(c - z)) < cell)
      dot(id, (x + a) / 2, (y + b) / 2, (z + c) / 2);
    else {
      lines.push(x, y, z, id, a, b, c, id);
      // An end-on line has no screen length. Keep an actual endpoint visible.
      dot(id, x, y, z);
    }
  }
  for (let n = 0, p = 0; n < arcOwners.length; n++, p += 13) {
    const id = arcOwners[n],
      j = n * 6;
    if (2 * arcs[p + 12] >= step) {
      thickArcs.push(n);
      continue;
    }
    if (
      Math.max(
        ...[0, 1, 2].map((k) => arcExtents[j + k + 3] - arcExtents[j + k]),
      ) < cell
    ) {
      dot(
        id,
        arcs[p + 2] + arcs[p + 5],
        arcs[p + 3] + arcs[p + 6],
        arcs[p + 4] + arcs[p + 7],
      );
      continue;
    }
    let oldX, oldY, oldZ;
    arcPoints(
      arcs,
      p,
      curveSteps(arcRadius(arcs, p), arcs[p + 11], step),
      (x, y, z, k) => {
        if (k) lines.push(oldX, oldY, oldZ, id, x, y, z, id);
        else dot(id, x, y, z);
        oldX = x;
        oldY = y;
        oldZ = z;
      },
    );
  }
  for (let n = 0, p = 0; p < faceCoords.length; n++, p += 9) {
    const id = faceOwners[n * 3],
      x = faceCoords[p],
      y = faceCoords[p + 1],
      z = faceCoords[p + 2];
    const ax = faceCoords[p + 3],
      ay = faceCoords[p + 4],
      az = faceCoords[p + 5],
      bx = faceCoords[p + 6],
      by = faceCoords[p + 7],
      bz = faceCoords[p + 8];
    if (
      Math.max(
        Math.max(x, ax, bx) - Math.min(x, ax, bx),
        Math.max(y, ay, by) - Math.min(y, ay, by),
        Math.max(z, az, bz) - Math.min(z, az, bz),
      ) < cell
    )
      dot(id, (x + ax + bx) / 3, (y + ay + by) / 3, (z + az + bz) / 3);
    else faces.push(x, y, z, id, ax, ay, az, id, bx, by, bz, id);
  }
  return {
    points: new Float32Array(points),
    lines: new Float32Array(lines),
    faces: new Float32Array(faces),
    thickTubes,
    thickArcs,
  };
}
