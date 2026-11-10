import { datasetProfile } from "../capabilities/datasetProfile";
import { isHexCornerMesh } from "../hexTopology";
import { createReservoirObject } from "../features/reservoir/reservoirObject";
import { createSurfaceObject } from "../features/surfaces/surfaceObject";
import { createNetworkObject } from "../features/network/networkObject";
import { createWellObject } from "../features/wells/wellObject";
import { createWellLogObject } from "../features/welllog/wellLogObject";
import type { DatasetObject, DatasetObjectInput } from "./datasetObject";

/** Both the primary dataset and overlays use the same domain rendering path. */
export function createDatasetObject(input: DatasetObjectInput): DatasetObject {
  const profile = datasetProfile(input.dataset);
  let handle: DatasetObject;
  // Generated I/J/K slices retain grid_dims and complete hex cells even though
  // they navigate as sections. Rendering topology and navigation are separate.
  const retainedHexCells =
    profile.isGrid &&
    profile.kind !== "well" &&
    profile.kind !== "welllog" &&
    isHexCornerMesh(input.positions.length / 3, input.dataset.n_cells);
  switch (retainedHexCells ? "reservoir" : profile.kind) {
    case "reservoir":
      handle = createReservoirObject(input);
      break;
    case "well":
      handle = createWellObject(input);
      break;
    case "welllog":
      handle = createWellLogObject(input);
      break;
    case "network":
      handle = createNetworkObject(input);
      break;
    case "surface":
    case "section":
      handle = createSurfaceObject(input);
      break;
  }
  if (handle.object) {
    handle.object.userData.datasetId = input.dataset.id;
    handle.object.userData.kind = profile.selectionType;
  }
  return handle;
}
