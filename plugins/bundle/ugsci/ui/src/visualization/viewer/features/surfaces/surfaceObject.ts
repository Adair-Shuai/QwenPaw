import { geometryPrimitive } from "../../rendering/datasetGeometry";
import { createLineObject } from "../../scene/lineObject";
import { createMeshObject } from "../../scene/meshObject";
import type { DatasetObjectInput } from "../../scene/datasetObject";

/** Surface and generated section datasets retain their supplied triangle topology. */
export function createSurfaceObject(input: DatasetObjectInput) {
  if (geometryPrimitive(input.dataset) === "lines")
    return createLineObject(input, input.indices);
  return createMeshObject(input);
}
