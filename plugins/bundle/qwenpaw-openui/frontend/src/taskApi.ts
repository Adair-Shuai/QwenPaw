import { TaskLayout } from "./TaskLayout";
import type { QwenPawWindowNamespace } from "./qwenpaw-host";

export interface OpenUITaskApi {
  version: 1;
  TaskLayout: typeof TaskLayout;
  dispose(): void;
}
type TaskHost = QwenPawWindowNamespace & { openui?: OpenUITaskApi };

export function registerTaskLayout(
  host: QwenPawWindowNamespace,
): OpenUITaskApi {
  const apiHost = host as TaskHost;
  apiHost.openui?.dispose();
  const api: OpenUITaskApi = {
    version: 1,
    TaskLayout,
    dispose() {
      if (apiHost.openui !== api) return;
      delete apiHost.openui;
      window.dispatchEvent(new Event("qwenpaw:openui-task-layout-ready"));
    },
  };
  apiHost.openui = api;
  window.dispatchEvent(new Event("qwenpaw:openui-task-layout-ready"));
  return api;
}
