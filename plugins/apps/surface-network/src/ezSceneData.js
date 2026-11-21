import { arcBounds, arcRadius } from "./ezCurves.js";
const NO_ASSET = 0xffffffff;
function emptyBounds() {
  return [
    [Infinity, Infinity, Infinity],
    [-Infinity, -Infinity, -Infinity],
  ];
}
function include(bounds, x, y, z, r) {
  const [low, high] = bounds;
  low[0] = Math.min(low[0], x - r);
  low[1] = Math.min(low[1], y - r);
  low[2] = Math.min(low[2], z - r);
  high[0] = Math.max(high[0], x + r);
  high[1] = Math.max(high[1], y + r);
  high[2] = Math.max(high[2], z + r);
}
export function validBounds(b) {
  return (
    Array.isArray(b) &&
    b.length === 2 &&
    b.every(
      (c) => Array.isArray(c) && c.length === 3 && c.every(Number.isFinite),
    ) &&
    b[1].every((v, i) => v >= b[0][i])
  );
}
// EZS1 stores project Z up, with Float32 positions relative to the catalog's origin.
export function decodeScene(buffer) {
  const header = buffer.byteLength >= 16 && new DataView(buffer, 0, 16);
  if (!header || header.getUint32(0) !== 0x455a5331)
    throw Error("场景索引版本无法识别");
  const segments = header.getUint32(4, true),
    triangles = header.getUint32(8, true),
    arcs = header.getUint32(12, true);
  if (buffer.byteLength !== 16 + segments * 36 + triangles * 44 + arcs * 52)
    throw Error("场景构件记录不完整");
  if (!segments && !triangles && !arcs)
    throw Error("没有可装配到工区坐标的构件");
  const f32 = new Float32Array(buffer, 16),
    u32 = new Uint32Array(buffer, 16);
  const owners = [null],
    trees = new Map(),
    bounds = emptyBounds();
  function ownerId(tree, node) {
    if (node === NO_ASSET) return 0;
    let entries = trees.get(tree);
    if (!entries) {
      entries = new Map();
      trees.set(tree, entries);
    }
    let id = entries.get(node);
    if (id === undefined) {
      id = owners.length;
      entries.set(node, id);
      owners.push({ key: [tree, node], bounds: emptyBounds() });
    }
    return id;
  }
  // Keep the original interleaved XYZR array for the instanced tubes. Triangle
  // positions are tightly packed separately so one draw call covers all faces.
  const tubeCoords = new Float32Array(buffer, 16, segments * 9),
    tubeOwners = new Float32Array(segments);
  const faceCoords = new Float32Array(triangles * 9),
    faceOwners = new Float32Array(triangles * 3);
  function addPoint(i, r, assetBounds) {
    const x = f32[i],
      y = f32[i + 1],
      z = f32[i + 2];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z))
      throw Error("场景索引含无效坐标");
    include(bounds, x, y, z, r);
    if (assetBounds) include(assetBounds, x, y, z, r);
  }
  for (let n = 0, i = 0; n < segments; n++, i += 9) {
    const id = ownerId(u32[i], u32[i + 1]),
      r = f32[i + 8];
    if (!Number.isFinite(r) || r <= 0) throw Error("场景索引含无效构件半径");
    tubeOwners[n] = id;
    const b = owners[id]?.bounds;
    addPoint(i + 2, r, b);
    addPoint(i + 5, r, b);
  }
  for (let n = 0, i = segments * 9; n < triangles; n++, i += 11) {
    const id = ownerId(u32[i], u32[i + 1]),
      b = owners[id]?.bounds;
    for (let v = 0; v < 3; v++) {
      const p = i + 2 + 3 * v,
        out = n * 9 + 3 * v;
      faceCoords[out] = f32[p];
      faceCoords[out + 1] = f32[p + 1];
      faceCoords[out + 2] = f32[p + 2];
      faceOwners[n * 3 + v] = id;
      addPoint(p, 0, b);
    }
  }
  const arcOffset = segments * 9 + triangles * 11;
  const arcCoords = new Float32Array(buffer, 16 + arcOffset * 4, arcs * 13),
    arcOwners = new Float32Array(arcs),
    arcExtents = new Float32Array(arcs * 6);
  for (let n = 0, i = 0; n < arcs; n++, i += 13) {
    for (let j = 2; j < 13; j++) {
      if (!Number.isFinite(arcCoords[i + j])) throw Error("场景圆弧坐标无效");
    }
    if (
      !(
        arcRadius(arcCoords, i) > 0 &&
        arcCoords[i + 12] > 0 &&
        arcCoords[i + 11]
      )
    )
      throw Error("场景圆弧参数无效");
    const id = ownerId(u32[arcOffset + i], u32[arcOffset + i + 1]);
    arcOwners[n] = id;
    const [low, high] = arcBounds(arcCoords, i);
    arcExtents.set(low, n * 6);
    arcExtents.set(high, n * 6 + 3);
    for (const target of [bounds, owners[id]?.bounds]) {
      if (!target) continue;
      include(target, ...low, 0);
      include(target, ...high, 0);
    }
  }
  return {
    tubeCoords,
    tubeOwners,
    faceCoords,
    faceOwners,
    arcCoords,
    arcOwners,
    arcExtents,
    owners,
    bounds,
    idFor(key) {
      return key ? trees.get(key[0])?.get(key[1]) ?? 0 : 0;
    },
  };
}
