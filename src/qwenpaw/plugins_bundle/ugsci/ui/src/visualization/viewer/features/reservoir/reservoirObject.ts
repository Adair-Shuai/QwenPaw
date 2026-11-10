import * as THREE from "three";
import { geometryPrimitive } from "../../rendering/datasetGeometry";
import { createLineObject } from "../../scene/lineObject";
import {
  buildHexEdgeIndex,
  extractHexCorners,
  isHexCornerMesh,
  maybeRemapHexPositions,
  tessellateHexOpmFan,
} from "../../hexTopology";
import { indexedGeometry, localCoordinates } from "../../scene/geometry";
import {
  applyMaterialColors,
  datasetObject,
  type DatasetObjectInput,
} from "../../scene/datasetObject";

export function createReservoirObject(input: DatasetObjectInput) {
  // Remapping is a reservoir concern and must not mutate the caller's binary data.
  const positions = input.positions.slice();
  const count = input.dataset.n_cells;
  maybeRemapHexPositions(positions, count);
  const corners = isHexCornerMesh(positions.length / 3, count)
    ? extractHexCorners(positions, count)
    : null;
  if (!corners && geometryPrimitive(input.dataset) === "lines")
    return createLineObject(input, input.indices);
  const coordinates = localCoordinates(corners || positions, input.origin);
  const hexCorners = corners ? coordinates.localPositions : null;
  const fan = hexCorners ? tessellateHexOpmFan(hexCorners, count) : null;
  const baseIndices = fan?.indices || input.indices;
  const geometry = indexedGeometry(
    fan?.positions || coordinates.localPositions,
    baseIndices,
    "triangles",
    fan?.normals,
  );
  const overlay = input.role === "overlay";
  const fallback = overlay ? 0x8b949e : 0x4488ff;
  const material = new THREE.MeshPhongMaterial({
    color: fallback,
    transparent: true,
    opacity: overlay ? 0.45 : input.opacity,
    side: THREE.DoubleSide,
    wireframe: hexCorners ? false : overlay || input.wireframe,
    clippingPlanes: [],
  });
  material.forceSinglePass = true;
  const mesh = new THREE.Mesh(geometry, material);
  let edges: THREE.LineSegments | null = null;
  if (hexCorners) {
    const edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(hexCorners, 3),
    );
    edgeGeometry.setIndex(
      new THREE.BufferAttribute(
        buildHexEdgeIndex(Array.from({ length: count }, (_, index) => index)),
        1,
      ),
    );
    edges = new THREE.LineSegments(
      edgeGeometry,
      new THREE.LineBasicMaterial({
        color: 0xd0d7de,
        transparent: true,
        opacity: overlay ? 0.7 : 0.85,
      }),
    );
    edges.name = "oilgas-hex-edges";
    edges.visible = overlay || input.wireframe;
    mesh.add(edges);
  }
  return datasetObject({
    object: mesh,
    geometry,
    baseIndices,
    ...coordinates,
    cellCount: count,
    hexCorners,
    edges,
    applyColors: (colors) => applyMaterialColors(material, colors, fallback),
    setWireframe(enabled) {
      if (edges) edges.visible = enabled;
      material.wireframe = edges ? false : enabled;
      material.needsUpdate = true;
    },
    setVisibleCells(offsets) {
      edges?.geometry.setIndex(
        new THREE.BufferAttribute(buildHexEdgeIndex(Array.from(offsets)), 1),
      );
    },
  });
}
