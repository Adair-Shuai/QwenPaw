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

export const componentsApi = {
  checkComponentUpdates: () =>
    request<ComponentUpdatesResponse>("/components/updates"),
  queueAllComponentUpdates: () =>
    request<QueueComponentUpdatesResponse>("/components/updates/install", {
      method: "POST",
    }),
};
