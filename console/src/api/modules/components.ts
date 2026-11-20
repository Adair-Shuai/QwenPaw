import type { DependencyUpgradeOperation } from "./plugin";
import { ApiError, request } from "../request";

export interface ComponentUpdateItem {
  component: string;
  from_version?: string | null;
  target_version?: string;
}

export interface ComponentUpdatesResponse {
  enabled: boolean;
  updates: ComponentUpdateItem[];
  /** Signed release supported by this host's component protocol. */
  compatible_desktop_version?: string | null;
}

export interface QueueComponentUpdatesResponse {
  enabled: boolean;
  queued: string[];
  restart_required: boolean;
}

export interface QueueComponentUpdateResponse {
  component: string;
  queued: boolean;
  restart_required?: boolean;
  reason?: string;
  updated?: boolean;
  dependency_operation?: DependencyUpgradeOperation;
  version?: string;
  loaded?: boolean;
}

export const componentsApi = {
  checkComponentUpdates: () =>
    request<ComponentUpdatesResponse>("/components/updates"),
  queueAllComponentUpdates: () =>
    request<QueueComponentUpdatesResponse>("/components/updates/install", {
      method: "POST",
    }),
  queueComponentUpdate: async (component: string, hot = false) => {
    const path = `/components/${encodeURIComponent(component)}`;
    try {
      return await request<QueueComponentUpdateResponse>(
        `${path}/${hot ? "update" : "install"}`,
        { method: "POST" },
      );
    } catch (error) {
      if (!hot || !(error instanceof ApiError) || error.status !== 404)
        throw error;
      return request<QueueComponentUpdateResponse>(`${path}/install`, {
        method: "POST",
      });
    }
  },
};
