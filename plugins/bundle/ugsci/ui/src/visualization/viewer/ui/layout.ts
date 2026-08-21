/** Shared chrome sizes for the Videx-style viewer shell. */

export const LAYOUT = {
  treeWidth: 256,
  treeCollapsed: 36,
  inspectorWidth: 300,
  inspectorCollapsed: 36,
  toolbarHeight: 34,
  tabsTop: 46,
  wellMapWidth: 228,
  wellMapHeight: 176,
  slicePlayerHeight: 32,
} as const;

export function chromeInsets(treeCollapsed: boolean, inspectorCollapsed: boolean) {
  return {
    left: treeCollapsed ? LAYOUT.treeCollapsed : LAYOUT.treeWidth,
    right: inspectorCollapsed ? LAYOUT.inspectorCollapsed : LAYOUT.inspectorWidth,
  };
}

export function applyChromeOffsets(elements: {
  tree: HTMLElement;
  inspector: HTMLElement;
  toolbar?: HTMLElement | null;
  tabs?: HTMLElement | null;
  info?: HTMLElement | null;
  hud?: HTMLElement | null;
  readout?: HTMLElement | null;
  wellMap?: HTMLElement | null;
  legend?: HTMLElement | null;
  histogram?: HTMLElement | null;
  details?: HTMLElement | null;
  wellLog?: HTMLElement | null;
  slicePlayer?: HTMLElement | null;
  compass?: HTMLElement | null;
  viewCluster?: HTMLElement | null;
  shortcuts?: HTMLElement | null;
  treeCollapsed: boolean;
  inspectorCollapsed: boolean;
}) {
  const { left, right } = chromeInsets(elements.treeCollapsed, elements.inspectorCollapsed);
  const gutter = 8;
  const viewportLeft = `${left + gutter}px`;
  const viewportRight = `${right + gutter}px`;
  const sliceBottom = 8;
  const sliceHeight = LAYOUT.slicePlayerHeight;

  elements.tree.style.left = "0";
  elements.tree.style.right = "auto";
  elements.tree.style.width = `${elements.treeCollapsed ? LAYOUT.treeCollapsed : LAYOUT.treeWidth}px`;

  elements.inspector.style.left = "auto";
  elements.inspector.style.right = "0";
  elements.inspector.style.width = `${
    elements.inspectorCollapsed ? LAYOUT.inspectorCollapsed : LAYOUT.inspectorWidth
  }px`;

  elements.toolbar?.style.setProperty("left", viewportLeft);
  elements.toolbar?.style.setProperty("right", viewportRight);
  elements.tabs?.style.setProperty("left", viewportLeft);
  elements.tabs?.style.setProperty("right", viewportRight);

  if (elements.slicePlayer) {
    elements.slicePlayer.style.left = viewportLeft;
    elements.slicePlayer.style.right = viewportRight;
    elements.slicePlayer.style.bottom = `${sliceBottom}px`;
  }
  if (elements.info) {
    elements.info.style.left = viewportLeft;
    elements.info.style.right = "auto";
    elements.info.style.bottom = `${sliceBottom + sliceHeight + 6}px`;
  }
  if (elements.wellMap) {
    elements.wellMap.style.left = viewportLeft;
    elements.wellMap.style.bottom = `${sliceBottom + sliceHeight + 28}px`;
  }
  if (elements.viewCluster) {
    elements.viewCluster.style.left = viewportLeft;
    elements.viewCluster.style.top = "88px";
  }
  if (elements.compass) {
    elements.compass.style.left = "auto";
    elements.compass.style.right = viewportRight;
    elements.compass.style.bottom = `${sliceBottom + sliceHeight + 6}px`;
  }
  if (elements.readout) {
    elements.readout.style.right = viewportRight;
    elements.readout.style.bottom = `${sliceBottom + sliceHeight + 86}px`;
    elements.readout.style.left = "auto";
  }
  if (elements.hud) {
    elements.hud.style.right = viewportRight;
    elements.hud.style.top = "88px";
    elements.hud.style.left = "auto";
  }
  if (elements.legend) {
    elements.legend.style.right = viewportRight;
    elements.legend.style.bottom = "250px";
    elements.legend.style.left = "auto";
  }
  if (elements.histogram) {
    elements.histogram.style.right = viewportRight;
    elements.histogram.style.bottom = "188px";
    elements.histogram.style.left = "auto";
  }
  if (elements.details) {
    elements.details.style.right = viewportRight;
    elements.details.style.bottom = "120px";
    elements.details.style.left = "auto";
    elements.details.style.width = "270px";
  }
  if (elements.wellLog) {
    elements.wellLog.style.right = viewportRight;
    elements.wellLog.style.top = "88px";
    elements.wellLog.style.bottom = "16px";
  }
  if (elements.shortcuts) {
    elements.shortcuts.style.left = viewportLeft;
  }
}
