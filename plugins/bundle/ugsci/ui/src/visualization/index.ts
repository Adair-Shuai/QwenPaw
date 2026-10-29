/**
 * UGSci-owned visualization entry.
 *
 * The heavy Three.js runtime remains a lazy provider asset for now.  The
 * route, menu item and workspace renderer are registered by UGSci, so users
 * do not see a second visualization plugin product entry.
 */

import { getHost } from "../core/runtime";
import { OilGasPluginPage } from "./PluginPage";
import { OilGasWorkspaceRenderer } from "./WorkspaceRenderer";
import { mountVisualization } from "./embed";

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

  const antdIcons = getHost().antdIcons || {};
  const GlobalOutlined = antdIcons.GlobalOutlined || antdIcons.AppstoreOutlined;

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
    icon: GlobalOutlined
      ? React.createElement(GlobalOutlined, { style: { fontSize: 16 } })
      : undefined,
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
      extensions: [
        "egrid",
        "grid",
        "grdecl",
        "init",
        "unrst",
        "roff",
        "roffbin",
        "dat",
        "sr3",
        "irf",
        "data",
        "model",
        "tnav",
        "tpr",
        "las",
        "las3",
        "dlis",
        "vtk",
        "vtu",
        "pvtu",
        "vti",
        "xdmf",
        "csv",
        "arrow",
        "parquet",
        "well.json",
        "surface.json",
        "network.json",
        "json",
      ],
      mimeTypes: [
        "application/x-eclipse-grid",
        "application/x-eclipse-init",
        "application/x-eclipse-unrst",
        "application/x-cmg-dat",
        "application/x-cmg-sr3",
        "application/x-tnavigator-data",
        "application/x-roff",
        "application/x-las",
        "application/x-dlis",
        "application/vnd.vtk",
        "application/x-vtu",
        "application/x-pvtu",
        "application/x-xdmf",
        "text/csv",
        "application/vnd.apache.arrow.file",
      ],
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
