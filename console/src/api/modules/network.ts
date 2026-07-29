import { request } from "../request";

export type ProxyMode = "auto" | "disabled" | "custom";

export interface NetworkConfig {
  proxy_mode: ProxyMode;
  custom_proxy_url: string;
  no_proxy_hosts: string[];
}

export const networkApi = {
  getConfig: () => request<NetworkConfig>("/config/network"),

  updateConfig: (body: NetworkConfig) =>
    request<NetworkConfig>("/config/network", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
