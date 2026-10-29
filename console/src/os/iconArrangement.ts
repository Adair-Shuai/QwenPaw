import type { TFunction } from "i18next";
import { OS_APPS, getAppLabel, type OsAppDef } from "./osApps";
import type { IconLayout } from "./osIconStore";

const coreIds = new Set(OS_APPS.map((app) => app.routeId));

export function iconTypeRank(app: OsAppDef): number {
  if (app.routeId.startsWith("os.")) return 0;
  if (coreIds.has(app.routeId)) return 1;
  return 2;
}

export function arrangeApps(
  apps: readonly OsAppDef[],
  layout: Exclude<IconLayout, "free">,
  t: TFunction,
  language?: string,
): OsAppDef[] {
  return [...apps].sort((left, right) => {
    if (layout === "type") {
      const rank = iconTypeRank(left) - iconTypeRank(right);
      if (rank !== 0) return rank;
    }
    return getAppLabel(left, t, language).localeCompare(
      getAppLabel(right, t, language),
      language,
      { numeric: true, sensitivity: "base" },
    );
  });
}
