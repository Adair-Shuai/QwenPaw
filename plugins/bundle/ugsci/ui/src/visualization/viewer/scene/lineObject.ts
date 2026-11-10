import * as THREE from "three";
import { indexedGeometry, localCoordinates } from "./geometry";
import {
  applyMaterialColors,
  datasetObject,
  type DatasetObjectInput,
} from "./datasetObject";

export function createLineObject(
  input: DatasetObjectInput,
  baseIndices: Uint32Array,
  network = false,
) {
  const coordinates = localCoordinates(input.positions, input.origin);
  const geometry = indexedGeometry(
    coordinates.localPositions,
    baseIndices,
    "lines",
  );
  const overlay = input.role === "overlay";
  const fallback = overlay ? (network ? 0xffb86c : 0xff6b9d) : 0x58a6ff;
  const material = new THREE.LineBasicMaterial({
    color: fallback,
    transparent: true,
    opacity: overlay ? 0.95 : input.opacity,
  });
  const object =
    overlay && !network
      ? new THREE.Line(geometry, material)
      : new THREE.LineSegments(geometry, material);
  return datasetObject({
    object,
    geometry,
    baseIndices,
    ...coordinates,
    cellCount: input.dataset.n_cells,
    applyColors: (colors) => applyMaterialColors(material, colors, fallback),
  });
}
