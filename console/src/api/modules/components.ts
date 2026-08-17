import { request } from "../request";

export interface ComponentUpdateItem {
  component: string;
  from_version?: string | null;
  target_version?: string;
}

export interface ComponentUpdatesResponse {
  enabled: boolean;
  updates: ComponentUpdateItem[];
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
}

export const componentsApi = {
  checkComponentUpdates: () =>
    request<ComponentUpdatesResponse>("/components/updates"),
  queueAllComponentUpdates: () =>
    request<QueueComponentUpdatesResponse>("/components/updates/install", {
      method: "POST",
    }),
  queueComponentUpdate: (component: string) =>
    request<QueueComponentUpdateResponse>(
      `/components/${encodeURIComponent(component)}/install`,
      { method: "POST" },
    ),
};
