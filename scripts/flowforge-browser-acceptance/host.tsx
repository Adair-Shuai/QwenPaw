/** Browser acceptance host: actual console dependencies and actual plugin bundle. */
import React from "../../console/node_modules/react";
import * as ReactDOM from "../../console/node_modules/react-dom";
import { createRoot } from "../../console/node_modules/react-dom/client";
import * as antd from "../../console/node_modules/antd";
import * as icons from "../../console/node_modules/@ant-design/icons";
import "../../console/node_modules/antd/dist/reset.css";

const root = createRoot(document.getElementById("root")!);
(window as any).QwenPaw = {
  host: {
    React, ReactDOM, antd, antdIcons: icons,
    getApiUrl: (path: string) => `/api${path}`,
    getApiToken: () => "",
    getSelectedAgentId: () => "default",
    useSelectedAgent: () => ({ id: "default" }),
  },
  route: { add: (_plugin: string, route: { component: React.ComponentType }) => {
    const Component = route.component;
    root.render(<antd.ConfigProvider theme={{ token: { colorPrimary: "#2563eb", borderRadius: 8 } }}>
      <antd.App><Component /></antd.App>
    </antd.ConfigProvider>);
    (window as any).__flowforgeMounted = true;
  } },
  menu: { add: () => undefined },
};
const script = document.createElement("script");
script.src = "/plugin.js";
script.onerror = () => { document.getElementById("root")!.textContent = "Plugin bundle failed to load"; };
document.head.appendChild(script);
