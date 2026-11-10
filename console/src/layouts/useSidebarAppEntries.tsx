import { useEffect, useState } from "react";
import { UgsciAppIcon } from "@/components/UgsciAppIcon";
import { pawappApi, type PawAppInfo } from "../api/modules/pawapp";
import { canOpenApp } from "../pages/AppCenter/AppCard";
import { subscribeToPluginChanges } from "../utils/pluginChangeEvents";
import type { FlatMenuEntry } from "./registry/adapter";

/** Resolve installed apps through the App Center's normal launch route. */
export function useSidebarAppEntries(enabled: boolean) {
  const [apps, setApps] = useState<PawAppInfo[]>([]);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let generation = 0;
    const refresh = async () => {
      const request = ++generation;
      try {
        const result = await pawappApi.list();
        if (request !== generation) return;
        setApps(result.apps);
        setError(false);
      } catch {
        if (request !== generation) return;
        setApps([]);
        setError(true);
      }
    };
    void refresh();
    const unsubscribe = subscribeToPluginChanges(() => void refresh());
    return () => {
      generation++;
      unsubscribe();
    };
  }, [enabled, revision]);
  const entries: FlatMenuEntry[] = enabled
    ? apps.filter(canOpenApp).map((app) => ({
        key: `pawapp:${app.id}`,
        path: `/apps/${encodeURIComponent(app.id)}`,
        label: app.name,
        icon: <UgsciAppIcon appId={app.id} size={18} />,
      }))
    : [];
  return { entries, error, retry: () => setRevision((value) => value + 1) };
}
