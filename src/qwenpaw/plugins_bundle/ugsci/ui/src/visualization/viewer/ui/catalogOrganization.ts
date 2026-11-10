/** Catalog presentation derived only from declared dataset metadata. */
import type { DatasetInfo } from "../contracts/types";
import {
  DATASET_GROUPS,
  datasetProfile,
  type DatasetGroupId,
} from "../capabilities/datasetProfile";
import {
  isDepthOnlyWell,
  isSpatialWell,
  wellDisplayName,
} from "../wellClassification";

export type CatalogMode = "data" | "layers";

export interface CatalogParent {
  id: string;
  label: string;
  available: boolean;
}

export interface CatalogEntry {
  dataset: DatasetInfo;
  parent: CatalogParent | null;
}

export interface CatalogGroup {
  id: DatasetGroupId;
  title: string;
  entries: CatalogEntry[];
}

export function datasetListLabel(dataset: DatasetInfo): string {
  if (isSpatialWell(dataset) || isDepthOnlyWell(dataset))
    return wellDisplayName(dataset);
  return dataset.name;
}

export function datasetMatchesQuery(
  dataset: DatasetInfo,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const wellName =
    typeof dataset.metadata?.well_name === "string"
      ? dataset.metadata.well_name
      : "";
  return [
    dataset.id,
    dataset.name,
    wellName,
    dataset.source || "",
    wellDisplayName(dataset),
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function declaredParent(
  dataset: DatasetInfo,
  byId: ReadonlyMap<string, DatasetInfo>,
): CatalogParent | null {
  const id = dataset.metadata?.parent_dataset;
  if (typeof id !== "string" || !id.trim() || id === dataset.id) return null;
  const parent = byId.get(id);
  return {
    id,
    label: parent ? datasetListLabel(parent) : id,
    available: Boolean(parent),
  };
}

export function organizeCatalog(
  datasets: readonly DatasetInfo[],
  options: {
    mode?: CatalogMode;
    query: string;
    visibleIds: ReadonlySet<string>;
  },
): CatalogGroup[] {
  const byId = new Map(datasets.map((dataset) => [dataset.id, dataset]));
  const groups: CatalogGroup[] = [
    ...DATASET_GROUPS.map((group) => ({
      ...group,
      entries: [] as CatalogEntry[],
    })),
    { id: "other", title: "其他", entries: [] },
  ];
  const grouped = new Map(groups.map((group) => [group.id, group]));
  const needle = options.query.trim().toLowerCase();
  for (const dataset of datasets) {
    const profile = datasetProfile(dataset);
    if (
      options.mode === "layers" &&
      (!options.visibleIds.has(dataset.id) || !profile.spatialOverlay)
    )
      continue;
    const parent = declaredParent(dataset, byId);
    const matchesParent =
      parent && `${parent.id} ${parent.label}`.toLowerCase().includes(needle);
    if (!datasetMatchesQuery(dataset, options.query) && !matchesParent)
      continue;
    grouped.get(profile.group)?.entries.push({ dataset, parent });
  }
  return groups.filter((group) => group.entries.length > 0);
}
