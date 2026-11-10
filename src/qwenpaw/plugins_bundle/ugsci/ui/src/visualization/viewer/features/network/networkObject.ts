import { geometryPrimitive } from "../../rendering/datasetGeometry";
import type { DatasetInfo } from "../../contracts/types";
import type { DatasetObjectInput } from "../../scene/datasetObject";
import { createLineObject } from "../../scene/lineObject";
import { createMeshObject } from "../../scene/meshObject";

export function networkLineIndices(
  dataset: DatasetInfo,
  indices: Uint32Array,
): Uint32Array {
  if (dataset.metadata?.geometry_primitive === "lines") return indices;
  if (
    dataset.source === "network" &&
    indices.length % 3 === 0 &&
    indices.every(
      (value, index) => index % 3 !== 2 || value === indices[index - 2],
    )
  ) {
    const pairs = new Uint32Array((indices.length / 3) * 2);
    for (
      let source = 0, target = 0;
      source < indices.length;
      source += 3, target += 2
    ) {
      pairs[target] = indices[source];
      pairs[target + 1] = indices[source + 1];
    }
    return pairs;
  }
  return indices;
}

export function createNetworkObject(input: DatasetObjectInput) {
  // Tube converters already provide surfaces; never replace those with line pairs.
  if (geometryPrimitive(input.dataset) === "triangles")
    return createMeshObject(input);
  return createLineObject(
    input,
    networkLineIndices(input.dataset, input.indices),
    true,
  );
}
