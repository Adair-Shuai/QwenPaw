import { OilGasVisualizationIcon } from "../navigationIcons";
/**
 * UGSci-owned visualization entry.
 *
 * The heavy Three.js runtime remains a lazy provider asset for now.  The
 * route, menu item and workspace renderer are registered by UGSci, so users
 * do not see a second visualization plugin product entry.
 */

import { OilGasPluginPage } from "./PluginPage";
import { OilGasWorkspaceRenderer } from "./WorkspaceRenderer";
import { mountVisualization } from "./embed";
import {
  WORKSPACE_PREVIEW_EXTENSIONS,
  WORKSPACE_PREVIEW_MIME_TYPES,
} from "./imports/formats";

export function registerVisualizationFrontend(QP: any, React: any): void {
  // The host can re-evaluate a plugin bundle during dev/HMR or after a
  // capability refresh. Keep the marker on window so a fresh module instance
  // cannot append a second identical sidebar entry.
  const registrationKey = "__ugsciVisualizationFrontendRegistered";
  const globalWindow = window as any;
  if (globalWindow[registrationKey]) return;
  globalWindow[registrationKey] = true;
  // A lazy, container-based API: applications reuse the engine without
  // duplicating Three.js, a route shell, or private workspace import logic.
  QP.ugsci = {
    ...QP.ugsci,
    visualization: { version: 1, mount: mountVisualization },
  };

  QP.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: OilGasPluginPage,
    meta: {
      domain: "workspace",
      title: "油气可视化",
      description: "地质气藏、井筒与地面管网的统一可视化工作台",
      scope: "agent",
      layout: "workbench",
      navigation: "rail",
    },
  });
  QP.menu.add("ugsci", {
    id: "ugsci.visualization",
    location: "primary.agentScoped",
    label: () => "油气可视化",
    icon: OilGasVisualizationIcon,
    route: "ugsci.visualization",
    order: 7,
    visible: () => true,
  });

  const workspace = QP.workspace;
  if (!workspace?.registerRenderer) return;
  try {
    workspace.registerRenderer({
      id: "ugsci.visualization",
      name: "UGSci 油气可视化",
      component: OilGasWorkspaceRenderer,
      // Generic CSV belongs to the native table preview. Pipeline/network
      // CSV remains available through an explicit visualization import.
      extensions: WORKSPACE_PREVIEW_EXTENSIONS,
      mimeTypes: WORKSPACE_PREVIEW_MIME_TYPES,
      priority: 200,
      description: "UGSci 油气三维网格、井、剖面和测井可视化",
    });
  } catch (error) {
    console.warn(
      "[ugsci] Visualization workspace renderer registration failed:",
      error,
    );
  }
}
