/** Dataset semantics shared by navigation, object trees and rendering adapters. */
import type {
  DatasetInfo,
  DomainSelection,
  ViewType,
} from "../contracts/types";

export type DatasetKind =
  | "reservoir"
  | "well"
  | "welllog"
  | "network"
  | "surface"
  | "section";
export type DatasetGroupId =
  | "grids"
  | "wells"
  | "logs"
  | "surfaces"
  | "networks"
  | "other";
export type WellPlacement = "spatial" | "depth-only";

export interface DatasetProfile {
  readonly kind: DatasetKind;
  readonly group: DatasetGroupId;
  readonly defaultView: ViewType;
  readonly supportedViews: readonly ViewType[];
  /** Object-level selection; individual grid cells are selected by the engine. */
  readonly selectionType: DomainSelection["type"];
  readonly spatialOverlay: boolean;
  readonly primitive: "lines" | "triangles";
  readonly placement: WellPlacement | null;
  readonly isGrid: boolean;
  /** Legacy manifests infer point association only when scalar and vertex counts match. */
  readonly pointScalarFallback: boolean;
}

interface SourceDefinition {
  readonly kind: "well" | "network" | "surface" | "section";
  readonly hasLogs?: boolean;
  readonly primitive?: "lines";
  readonly pointScalarFallback?: boolean;
}

const SOURCES: Readonly<Record<string, SourceDefinition>> = {
  wellbore: { kind: "well", pointScalarFallback: true },
  well: { kind: "well", pointScalarFallback: true },
  trajectory: { kind: "well", pointScalarFallback: true },
  las: { kind: "well", hasLogs: true, pointScalarFallback: true },
  dlis: { kind: "well", hasLogs: true, pointScalarFallback: true },
  network: { kind: "network", primitive: "lines", pointScalarFallback: true },
  "network-tube": { kind: "network" },
  surface: { kind: "surface" },
  intersection: { kind: "section" },
  "well-intersection": { kind: "section" },
  slice: { kind: "section" },
};

export const DATASET_GROUPS: ReadonlyArray<{
  id: DatasetGroupId;
  title: string;
}> = [
  { id: "grids", title: "网格" },
  { id: "wells", title: "井" },
  { id: "logs", title: "测井" },
  { id: "surfaces", title: "层面 / 剖面" },
  { id: "networks", title: "管网" },
];

function sourceDefinition(source?: string): SourceDefinition | undefined {
  return source && Object.prototype.hasOwnProperty.call(SOURCES, source)
    ? SOURCES[source]
    : undefined;
}

export function isWellSource(source: string | undefined): boolean {
  return sourceDefinition(source)?.kind === "well";
}

export function resolveWellPlacement(
  dataset: DatasetInfo,
): WellPlacement | null {
  const source = sourceDefinition(dataset.source);
  if (source?.kind !== "well") return null;
  const metadata = dataset.metadata || {};
  // Preserve the existing explicit-metadata precedence for old manifests.
  if (metadata.placement === "spatial" || metadata.spatial === true)
    return "spatial";
  if (metadata.placement === "depth-only" || metadata.spatial === false)
    return "depth-only";
  return source.hasLogs ? "depth-only" : "spatial";
}

export function datasetProfile(dataset: DatasetInfo): DatasetProfile {
  const source = sourceDefinition(dataset.source);
  const placement = resolveWellPlacement(dataset);
  // Unknown and source-less legacy manifests were treated as reservoir grids.
  const isGrid =
    Boolean(dataset.grid_dims && dataset.grid_dims.length >= 3) || !source;
  const kind: DatasetKind =
    source?.kind === "well"
      ? placement === "depth-only"
        ? "welllog"
        : "well"
      : source?.kind || "reservoir";
  const defaultView: ViewType =
    kind === "well"
      ? "wellbore"
      : kind === "welllog"
      ? "welllog"
      : kind === "network"
      ? "network"
      : kind === "surface" || kind === "section"
      ? "intersection"
      : "reservoir";
  const supportedViews: ViewType[] = [defaultView];
  if (kind === "well" && source?.hasLogs) supportedViews.push("welllog");
  if (isGrid && !supportedViews.includes("reservoir"))
    supportedViews.push("reservoir");
  const explicitPrimitive = dataset.metadata?.geometry_primitive;
  const primitive =
    explicitPrimitive === "lines" || explicitPrimitive === "triangles"
      ? explicitPrimitive
      : source?.primitive || "triangles";
  return {
    kind,
    group: isGrid
      ? "grids"
      : kind === "well"
      ? "wells"
      : kind === "welllog"
      ? "logs"
      : kind === "network"
      ? "networks"
      : "surfaces",
    defaultView,
    supportedViews,
    selectionType: placement
      ? "well"
      : kind === "network" || primitive === "lines"
      ? "segment"
      : "surface",
    spatialOverlay: placement !== "depth-only",
    primitive,
    placement,
    isGrid,
    pointScalarFallback: Boolean(source?.pointScalarFallback),
  };
}

export function datasetSupportsView(
  dataset: DatasetInfo,
  view: ViewType,
): boolean {
  return datasetProfile(dataset).supportedViews.includes(view);
}

/** Loads select their domain view; spatial logs may retain the explicit log view. */
export function preferredDatasetView(
  dataset: DatasetInfo,
  currentView?: ViewType,
): ViewType {
  const profile = datasetProfile(dataset);
  return currentView === "welllog" &&
    profile.placement === "spatial" &&
    profile.supportedViews.includes("welllog")
    ? "welllog"
    : profile.defaultView;
}

/** Source-level hints for legacy overlay callers; use profiles for dataset eligibility. */
export function datasetSourcesForView(view: string): string[] {
  return Object.entries(SOURCES)
    .filter(([, definition]) =>
      view === "wellbore" || view === "welllog"
        ? definition.kind === "well"
        : view === "network"
        ? definition.kind === "network"
        : view === "intersection"
        ? definition.kind === "surface" || definition.kind === "section"
        : false,
    )
    .map(([source]) => source);
}
