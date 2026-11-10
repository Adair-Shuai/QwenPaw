import { indexedGeometry, localCoordinates } from "../../scene/geometry";
import {
  datasetObject,
  type DatasetObjectInput,
} from "../../scene/datasetObject";

/** Depth logs keep scalar/coordinate data available without inventing a 3D well. */
export function createWellLogObject(input: DatasetObjectInput) {
  const coordinates = localCoordinates(input.positions, [0, 0, 0]);
  const baseIndices = input.indices;
  const geometry = indexedGeometry(
    coordinates.localPositions,
    baseIndices,
    "lines",
  );
  return datasetObject({
    object: null,
    geometry,
    baseIndices,
    ...coordinates,
    cellCount: input.dataset.n_cells,
  });
}
