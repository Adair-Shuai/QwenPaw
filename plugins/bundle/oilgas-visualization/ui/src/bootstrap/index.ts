/**
 * Oil & Gas Visualization — Bootstrap entry point.
 *
 * This is the LIGHTWEIGHT entry that QwenPaw loads at startup.
 * It registers the route and menu, but does NOT import Three.js.
 * The heavy viewer runtime is loaded lazily by viewerLoader.ts
 * only when the user navigates to the visualization page.
 *
 * Architecture:
 *   QwenPaw host React
 *     └─ OilGasPluginPage (this file, <150 KiB)
 *          └─ <div ref={mountPoint} />
 *               └─ lazy load viewer-runtime.js (IIFE, ~5-15 MiB)
 *                    └─ Three.js + OrbitControls + rendering
 */

import { getHost } from "../core/runtime";
import { OilGasPluginPage } from "./PluginPage";
import { OilGasWorkspaceRenderer } from "./WorkspaceRenderer";

// ─── Plugin Registration ──────────────────────────────────────────────────────

function buildPlugin() {
  const QP = (window as any).QwenPaw;
  if (!QP?.menu || !QP?.route) {
    console.warn(
      "[oilgas-vis] QwenPaw.menu/route API not available — plugin disabled",
    );
    return;
  }

  const React = getHost().React;
  const PLUGIN_ID = "oilgas-visualization";
  const antdIcons = getHost().antdIcons || {};
  const GlobalOutlined = antdIcons.GlobalOutlined || antdIcons.AppstoreOutlined;

  // ── Register Route ────────────────────────────────────────────────
  QP.route.add(PLUGIN_ID, {
    id: "oilgas-vis.page",
    path: "/oilgas-visualization",
    component: OilGasPluginPage,
  });

  // ── Register Menu in every host mode ─────────────────────────────
  QP.menu.add(PLUGIN_ID, {
    id: "oilgas-vis.page",
    location: "primary.agentScoped",
    label: () => "油气可视化",
    icon: GlobalOutlined
      ? React.createElement(GlobalOutlined, { style: { fontSize: 16 } })
      : undefined,
    route: "oilgas-vis.page",
    order: 7,
    visible: () => true,
  });

  console.info(
    "[oilgas-vis] Plugin registered — route /oilgas-visualization",
  );

  // ── Register Workspace Renderer (deferred) ────────────────────────
  // The Workspace SDK may not be available yet — use polling.
  if (QP.workspace?.registerRenderer) {
    registerWorkspaceRenderer(QP);
  } else {
    // Defer registration until SDK is ready
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (QP.workspace?.registerRenderer) {
        clearInterval(timer);
        registerWorkspaceRenderer(QP);
      } else if (attempts > 200) {
        // 10 seconds timeout
        clearInterval(timer);
        console.warn(
          "[oilgas-vis] Workspace SDK not available — file renderer not registered",
        );
      }
    }, 50);
  }
}

function registerWorkspaceRenderer(QP: any) {
  const supported = [
    "egrid", "grid", "grdecl", "init", "unrst", "roff", "roffbin",
    "las", "las3", "dlis", "vtk", "vtu", "vti", "csv", "arrow", "parquet",
    "well.json", "surface.json", "network.json",
  ];

  try {
    QP.workspace.registerRenderer({
      id: "oilgas-visualization",
      name: "Oil & Gas Visualization",
      component: OilGasWorkspaceRenderer,
      extensions: supported,
      mimeTypes: [
        "application/x-eclipse-grid",
        "application/x-roff",
        "application/x-las",
        "application/x-dlis",
        "application/vnd.vtk",
        "text/csv",
        "application/vnd.apache.arrow.file",
      ],
      priority: 200,
      description: "油气三维网格、井、剖面和测井可视化",
    });
    console.info("[oilgas-vis] Workspace renderer registered");
  } catch (err) {
    console.warn("[oilgas-vis] Workspace renderer registration failed:", err);
  }
}

// ─── Entry ───────────────────────────────────────────────────────────────────

buildPlugin();
