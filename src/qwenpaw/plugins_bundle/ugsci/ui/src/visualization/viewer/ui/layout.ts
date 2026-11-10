/** One set of bounds for the workbench panels, tools and viewport overlays. */
export const LAYOUT = {
  treeWidth: 224,
  treeCollapsed: 36,
  inspectorWidth: 280,
  inspectorCollapsed: 36,
  gutter: 8,
  toolbarTop: 8,
  toolbarHeight: 34,
  tabsTop: 46,
  tabsHeight: 34,
  contentTop: 88,
  infoHeight: 32,
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

/** Set defaults on entry to a size tier; subsequent user toggles stay explicit. */
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
  const { gutter, contentTop } = LAYOUT;
  const viewportLeft = `${left + gutter}px`;
  const viewportRight = `${right + gutter}px`;
  const width =
    elements.containerWidth ||
    elements.tree.parentElement?.clientWidth ||
    Infinity;
  const height =
    elements.containerHeight ||
    elements.tree.parentElement?.clientHeight ||
    Infinity;
  const available = Math.max(0, width - left - right - gutter * 2);
  const viewportWidth = Number.isFinite(available)
    ? `${available}px`
    : `calc(100% - ${left + right + gutter * 2}px)`;
  const remainingHeight = (reserved: number) =>
    Number.isFinite(height)
      ? `${Math.max(0, height - reserved)}px`
      : `calc(100% - ${reserved}px)`;
  const compact = available < 680 || height < 540;
  const narrow = available < 420;
  const displayed = (element?: HTMLElement | null) =>
    Boolean(element && !element.hidden && element.style.display !== "none");
  const measuredHeight = (
    element: HTMLElement | null | undefined,
    fallback: number,
  ) => element?.offsetHeight || fallback;
  const logView = displayed(elements.wellLog);
  const show = (element: HTMLElement | null | undefined, visible: boolean) => {
    // Never change a feature's display/hidden state while adapting its position.
    if (element) element.style.visibility = visible ? "" : "hidden";
    return visible && displayed(element);
  };
  const horizontalBounds = (element: HTMLElement | null | undefined) => {
    if (!element) return;
    element.style.left = viewportLeft;
    element.style.right = viewportRight;
    element.style.minWidth = "0";
    element.style.boxSizing = "border-box";
  };

  Object.assign(elements.tree.style, {
    left: "0",
    right: "auto",
    top: "0",
    bottom: "0",
    width: `${left}px`,
    boxSizing: "border-box",
  });
  Object.assign(elements.inspector.style, {
    left: "auto",
    right: "0",
    top: "0",
    bottom: "0",
    width: `${right}px`,
    boxSizing: "border-box",
  });

  for (const [row, top, rowHeight] of [
    [elements.toolbar, LAYOUT.toolbarTop, LAYOUT.toolbarHeight],
    [elements.tabs, LAYOUT.tabsTop, LAYOUT.tabsHeight],
  ] as const) {
    if (!row) continue;
    horizontalBounds(row);
    Object.assign(row.style, {
      top: `${top}px`,
      height: `${rowHeight}px`,
      whiteSpace: "nowrap",
      overflowX: "auto",
      overflowY: "hidden",
      flexWrap: "nowrap",
      pointerEvents: "auto",
    });
    for (const child of Array.from(row.children)) {
      (child as HTMLElement).style.flexShrink = "0";
      (child as HTMLElement).style.whiteSpace = "nowrap";
    }
  }

  // Bottom rows get their own space. A disabled/absent slice player reserves none.
  let footerTop = gutter;
  if (elements.slicePlayer) {
    horizontalBounds(elements.slicePlayer);
    Object.assign(elements.slicePlayer.style, {
      bottom: `${footerTop}px`,
      height: `${LAYOUT.slicePlayerHeight}px`,
      overflowX: "auto",
      overflowY: "hidden",
    });
    const slider = elements.slicePlayer.querySelector<HTMLInputElement>(
      'input[type="range"]',
    );
    if (slider) slider.style.minWidth = "24px";
    if (displayed(elements.slicePlayer))
      footerTop += LAYOUT.slicePlayerHeight + gutter;
  }
  if (elements.info) {
    horizontalBounds(elements.info);
    Object.assign(elements.info.style, {
      bottom: `${footerTop}px`,
      height: `${LAYOUT.infoHeight}px`,
      maxWidth: "none",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    });
    if (displayed(elements.info)) footerTop += LAYOUT.infoHeight + gutter;
  }

  const clusterHeight = measuredHeight(elements.viewCluster, 112);
  const clusterVisible = show(
    elements.viewCluster,
    !logView &&
      !narrow &&
      height - contentTop - footerTop >= clusterHeight + gutter,
  );
  if (elements.viewCluster)
    Object.assign(elements.viewCluster.style, {
      left: viewportLeft,
      right: "auto",
      top: `${contentTop}px`,
      bottom: "auto",
    });
  let hudVisible = false;
  if (elements.hud) {
    Object.assign(elements.hud.style, {
      left: `${left + gutter + (clusterVisible ? 100 : 0)}px`,
      right: "auto",
      top: `${contentTop}px`,
      bottom: "auto",
      minWidth: "0",
      maxWidth: "180px",
      boxSizing: "border-box",
    });
    hudVisible = show(elements.hud, !logView && !compact);
  }
  const upperLimit =
    contentTop +
    Math.max(
      clusterVisible ? clusterHeight + gutter : 0,
      hudVisible ? measuredHeight(elements.hud, 116) + gutter : 0,
    );

  // Stack left overlays by their actual height so text and the map cannot overlap.
  let leftBottom = footerTop;
  if (elements.wellMap) {
    Object.assign(elements.wellMap.style, {
      left: viewportLeft,
      right: "auto",
      top: "auto",
      bottom: `${leftBottom}px`,
      width: `${LAYOUT.wellMapWidth}px`,
      height: `${LAYOUT.wellMapHeight}px`,
    });
    if (
      show(
        elements.wellMap,
        !logView &&
          !compact &&
          height - upperLimit - leftBottom >= LAYOUT.wellMapHeight + gutter,
      )
    )
      leftBottom += LAYOUT.wellMapHeight + gutter;
  }
  if (elements.readout) {
    Object.assign(elements.readout.style, {
      left: viewportLeft,
      right: "auto",
      top: "auto",
      bottom: `${leftBottom}px`,
      width: `${LAYOUT.wellMapWidth}px`,
      maxWidth: viewportWidth,
    });
    const readoutHeight = measuredHeight(elements.readout, 160);
    show(
      elements.readout,
      !logView &&
        !compact &&
        height - upperLimit - leftBottom >= readoutHeight + gutter,
    );
  }

  // Selection details take priority over decorative overlays on shorter windows.
  const detailReserve = displayed(elements.details)
    ? Math.min(180, Math.max(0, height - contentTop - footerTop - gutter))
    : 0;
  let rightBottom = footerTop;
  for (const [widget, fallbackHeight, eligible] of [
    [elements.compass, 108, !narrow],
    [elements.legend, 80, true],
    [elements.histogram, 58, !compact],
  ] as const) {
    if (!widget) continue;
    Object.assign(widget.style, {
      right: viewportRight,
      left: "auto",
      top: "auto",
      bottom: `${rightBottom}px`,
      maxWidth: viewportWidth,
      boxSizing: "border-box",
    });
    const widgetHeight = measuredHeight(widget, fallbackHeight);
    if (
      show(
        widget,
        !logView &&
          eligible &&
          height - contentTop - detailReserve - rightBottom >=
            widgetHeight + gutter,
      )
    )
      rightBottom += widgetHeight + gutter;
  }
  if (elements.details)
    Object.assign(elements.details.style, {
      right: viewportRight,
      left: "auto",
      top: "auto",
      bottom: `${rightBottom}px`,
      width: "270px",
      maxWidth: viewportWidth,
      boxSizing: "border-box",
      maxHeight: `${Math.max(
        0,
        Math.min(260, height - contentTop - rightBottom - gutter),
      )}px`,
      overflowY: "auto",
    });
  if (elements.wellLog)
    Object.assign(elements.wellLog.style, {
      right: viewportRight,
      left: "auto",
      top: `${contentTop}px`,
      bottom: `${footerTop}px`,
      maxWidth: viewportWidth,
      boxSizing: "border-box",
      height: remainingHeight(contentTop + footerTop),
    });
  if (elements.shortcuts) {
    horizontalBounds(elements.shortcuts);
    Object.assign(elements.shortcuts.style, {
      top: `${contentTop}px`,
      bottom: "auto",
      maxHeight: remainingHeight(contentTop + footerTop),
      overflowY: "auto",
    });
  }
}
