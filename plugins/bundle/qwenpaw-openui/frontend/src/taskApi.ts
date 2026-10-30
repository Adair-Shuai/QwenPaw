import { TaskLayout } from "./TaskLayout";
import { InteractionForm } from "./interactions/InteractionForm";
import type { QwenPawWindowNamespace } from "./qwenpaw-host";

export interface OpenUITaskApi {
  version: 1;
  TaskLayout: typeof TaskLayout;
  InteractionForm: typeof InteractionForm;
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
    InteractionForm,
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
