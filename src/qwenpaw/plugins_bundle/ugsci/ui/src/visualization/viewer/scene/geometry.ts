import * as THREE from "three";

export type ModelOrigin = [number, number, number];

export function localCoordinates(
  positions: Float32Array,
  fixedOrigin?: ModelOrigin,
) {
  const origin: ModelOrigin = fixedOrigin ? [...fixedOrigin] : [0, 0, 0];
  if (!fixedOrigin) {
    for (let index = 0; index < positions.length; index += 3) {
      origin[0] += positions[index];
      origin[1] += positions[index + 1];
      origin[2] += positions[index + 2];
    }
    const count = positions.length / 3;
    origin[0] /= count;
    origin[1] /= count;
    origin[2] /= count;
  }
  const localPositions = new Float32Array(positions.length);
  for (let index = 0; index < positions.length; index++) {
    localPositions[index] = positions[index] - origin[index % 3];
  }
  return { origin, localPositions };
}

export function indexedGeometry(
  positions: Float32Array,
  indices: Uint32Array,
  primitive: "lines" | "triangles",
  normals?: Float32Array,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  if (normals)
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  else if (primitive === "triangles") geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
