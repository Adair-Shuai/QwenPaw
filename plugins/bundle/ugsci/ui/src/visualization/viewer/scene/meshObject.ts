import * as THREE from "three";
import { indexedGeometry, localCoordinates } from "./geometry";
import {
  applyMaterialColors,
  datasetObject,
  type DatasetObjectInput,
} from "./datasetObject";

/** Common triangle rendering, without assumptions about its domain or navigation. */
export function createMeshObject(input: DatasetObjectInput) {
  const coordinates = localCoordinates(input.positions, input.origin);
  const geometry = indexedGeometry(
    coordinates.localPositions,
    input.indices,
    "triangles",
  );
  const overlay = input.role === "overlay";
  const fallback = overlay ? 0x8b949e : 0x4488ff;
  const material = new THREE.MeshPhongMaterial({
    color: fallback,
    transparent: true,
    opacity: overlay ? 0.45 : input.opacity,
    side: THREE.DoubleSide,
    wireframe: overlay || input.wireframe,
    clippingPlanes: [],
  });
  material.forceSinglePass = !overlay;
  return datasetObject({
    object: new THREE.Mesh(geometry, material),
    geometry,
    baseIndices: input.indices,
    ...coordinates,
    cellCount: input.dataset.n_cells,
    applyColors: (colors) => applyMaterialColors(material, colors, fallback),
    setWireframe(enabled) {
      material.wireframe = enabled;
      material.needsUpdate = true;
    },
  });
}
