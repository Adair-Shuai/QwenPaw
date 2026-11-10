import type { ViewType } from "../contracts/types";

/** Existing workbench views; data domains do not introduce extra product tabs. */
export const VIEW_DEFINITIONS: ReadonlyArray<{ id: ViewType; label: string }> =
  [
    { id: "reservoir", label: "储层 3D" },
    { id: "wellbore", label: "井筒 3D" },
    { id: "intersection", label: "剖面" },
    { id: "welllog", label: "测井" },
    { id: "network", label: "管网" },
    { id: "benchmark", label: "基准测试" },
  ];

export const VIEW_LABELS = Object.fromEntries(
  VIEW_DEFINITIONS.map(({ id, label }) => [id, label]),
) as Record<ViewType, string>;

export const VIEW_IDS: ViewType[] = VIEW_DEFINITIONS.map(({ id }) => id);
