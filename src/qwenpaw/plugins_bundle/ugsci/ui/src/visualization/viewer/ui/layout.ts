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

export function chromeInsets(
  treeCollapsed: boolean,
  inspectorCollapsed: boolean,
) {
  return {
    left: treeCollapsed ? LAYOUT.treeCollapsed : LAYOUT.treeWidth,
    right: inspectorCollapsed
      ? LAYOUT.inspectorCollapsed
      : LAYOUT.inspectorWidth,
  };
}

/** Apply these defaults when entering a smaller size tier, then allow user toggles. */
export function responsiveChromeState(width: number) {
  return {
    treeCollapsed: width > 0 && width < 760,
    inspectorCollapsed: width > 0 && width < 1100,
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
  containerWidth?: number;
  containerHeight?: number;
}) {
  const { left, right } = chromeInsets(
    elements.treeCollapsed,
    elements.inspectorCollapsed,
  );
  const gutter = 8;
  const viewportLeft = `${left + gutter}px`;
  const viewportRight = `${right + gutter}px`;
  const sliceBottom = 8;
  const sliceHeight = LAYOUT.slicePlayerHeight;
  const width =
    elements.containerWidth ||
    elements.tree.parentElement?.clientWidth ||
    Infinity;
  const height =
    elements.containerHeight ||
    elements.tree.parentElement?.clientHeight ||
    Infinity;
  const available = Math.max(0, width - left - right - gutter * 2);
  const compact = available < 640 || height < 540;
  const narrow = available < 420;

  elements.tree.style.left = "0";
  elements.tree.style.right = "auto";
  elements.tree.style.width = `${
    elements.treeCollapsed ? LAYOUT.treeCollapsed : LAYOUT.treeWidth
  }px`;

  elements.inspector.style.left = "auto";
  elements.inspector.style.right = "0";
  elements.inspector.style.width = `${
    elements.inspectorCollapsed
      ? LAYOUT.inspectorCollapsed
      : LAYOUT.inspectorWidth
  }px`;

  elements.toolbar?.style.setProperty("left", viewportLeft);
  elements.toolbar?.style.setProperty("right", viewportRight);
  elements.tabs?.style.setProperty("left", viewportLeft);
  elements.tabs?.style.setProperty("right", viewportRight);
  for (const row of [elements.toolbar, elements.tabs]) {
    if (!row) continue;
    row.style.whiteSpace = "nowrap";
    row.style.overflowX = "auto";
    row.style.overflowY = "hidden";
    row.style.flexWrap = "nowrap";
    row.style.minWidth = "0";
    row.style.pointerEvents = "auto";
    for (const child of Array.from(row.children)) {
      (child as HTMLElement).style.flexShrink = "0";
      (child as HTMLElement).style.whiteSpace = "nowrap";
    }
  }
  // Preserve each widget's functional display state; only suppress secondary
  // overlays when they would cover the model or the selection details.
  for (const widget of [
    elements.wellMap,
    elements.readout,
    elements.hud,
    elements.histogram,
  ]) {
    if (widget) widget.style.visibility = compact ? "hidden" : "";
  }
  if (elements.compass)
    elements.compass.style.visibility = narrow ? "hidden" : "";

  if (elements.slicePlayer) {
    elements.slicePlayer.style.left = viewportLeft;
    elements.slicePlayer.style.right = viewportRight;
    elements.slicePlayer.style.bottom = `${sliceBottom}px`;
    elements.slicePlayer.style.overflowX = "auto";
    const slider = elements.slicePlayer.querySelector<HTMLInputElement>(
      'input[type="range"]',
    );
    if (slider) slider.style.minWidth = "24px";
  }
  if (elements.info) {
    elements.info.style.left = viewportLeft;
    elements.info.style.right = viewportRight;
    elements.info.style.maxWidth = "none";
    elements.info.style.whiteSpace = "nowrap";
    elements.info.style.overflow = "hidden";
    elements.info.style.textOverflow = "ellipsis";
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
    elements.readout.style.right = "auto";
    elements.readout.style.bottom = "252px";
    elements.readout.style.left = viewportLeft;
  }
  if (elements.hud) {
    elements.hud.style.right = "auto";
    elements.hud.style.top = "88px";
    elements.hud.style.left = `${left + gutter + 104}px`;
  }
  if (elements.legend) {
    elements.legend.style.right = viewportRight;
    elements.legend.style.left = "auto";
    elements.legend.style.maxWidth = `max(0px, calc(100% - ${
      left + right + gutter * 2
    }px))`;
    elements.legend.style.bottom = `${sliceBottom + sliceHeight + 114}px`;
  }
  if (elements.histogram) {
    elements.histogram.style.right = viewportRight;
    elements.histogram.style.bottom = `${sliceBottom + sliceHeight + 182}px`;
    elements.histogram.style.left = "auto";
  }
  if (elements.details) {
    elements.details.style.right = viewportRight;
    elements.details.style.left = "auto";
    elements.details.style.width = "270px";
    elements.details.style.maxWidth = `max(0px, calc(100% - ${
      left + right + gutter * 2
    }px))`;
    elements.details.style.boxSizing = "border-box";
    elements.details.style.maxHeight = compact
      ? "40%"
      : "min(260px, calc(100% - 370px))";
    elements.details.style.overflowY = "auto";
    elements.details.style.bottom = `${
      sliceBottom + sliceHeight + (compact ? 186 : 246)
    }px`;
  }
  if (elements.wellLog) {
    elements.wellLog.style.right = viewportRight;
    elements.wellLog.style.top = "88px";
    elements.wellLog.style.bottom = "16px";
    elements.wellLog.style.maxWidth = `max(0px, calc(100% - ${
      left + right + gutter * 2
    }px))`;
  }
  if (elements.shortcuts) {
    elements.shortcuts.style.left = viewportLeft;
    elements.shortcuts.style.right = viewportRight;
    elements.shortcuts.style.maxHeight = "calc(100% - 100px)";
    elements.shortcuts.style.overflowY = "auto";
  }
}
