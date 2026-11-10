import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { uniquePolyline, wellDisplayName } from "../../wellClassification";
import { applyWellTubeColors, buildWellTubeMesh } from "../../wellTubeGeometry";
import { indexedGeometry, localCoordinates } from "../../scene/geometry";
import {
  datasetObject,
  type DatasetObjectInput,
} from "../../scene/datasetObject";

export function createWellObject(input: DatasetObjectInput) {
  const coordinates = localCoordinates(input.positions, input.origin);
  const { localPositions } = coordinates;
  const baseIndices = input.indices;
  const geometry = indexedGeometry(localPositions, baseIndices, "lines");
  const tube = buildWellTubeMesh(localPositions);
  const object = tube ? new THREE.Group() : null;
  if (object && tube) {
    object.name = `oilgas-well-${input.dataset.id}`;
    object.add(tube);
    const element = document.createElement("div");
    element.textContent = wellDisplayName(input.dataset);
    element.style.cssText =
      "color:#f0c14b;font:600 11px/1.2 sans-serif;white-space:nowrap;text-shadow:0 1px 2px #000;pointer-events:none;user-select:none;";
    const label = new CSS2DObject(element);
    label.name = "oilgas-well-label";
    label.visible = input.wellLabelsVisible;
    const head = uniquePolyline(localPositions)[0];
    if (head) label.position.set(...head);
    object.add(label);
  }
  return datasetObject({
    object,
    geometry,
    baseIndices,
    ...coordinates,
    cellCount: input.dataset.n_cells,
    applyColors(colors) {
      if (tube)
        applyWellTubeColors(
          tube,
          geometry.getAttribute("position") as THREE.BufferAttribute,
          colors,
        );
    },
    setWireframe(enabled) {
      if (tube) {
        const material = tube.material as THREE.MeshPhongMaterial;
        material.wireframe = enabled;
        material.needsUpdate = true;
      }
    },
  });
}
