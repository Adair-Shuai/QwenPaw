import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, within } from "@testing-library/react";
import {
  applyChromeOffsets,
  chromeInsets,
  LAYOUT,
  responsiveChromeState,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/layout";
import { createReadoutPanel } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/readout";
import { createWellMapPanel } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/wellMap";
import { ViewRouter } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/app/view-router";

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function workbench(width = 1500, height = 900) {
  const root = document.createElement("div");
  document.body.appendChild(root);
  Object.defineProperties(root, {
    clientWidth: { value: width, configurable: true },
    clientHeight: { value: height, configurable: true },
  });
  const element = (height: number) => {
    const node = document.createElement("div");
    Object.defineProperty(node, "offsetHeight", { value: height });
    return root.appendChild(node);
  };
  const readout = createReadoutPanel();
  // Longer names and translated labels can make the real readout taller.
  Object.defineProperty(readout, "offsetHeight", { value: 192 });
  root.appendChild(readout);
  const wellMap = createWellMapPanel().root;
  root.appendChild(wellMap);
  const elements = {
    tree: element(height),
    inspector: element(height),
    toolbar: element(34),
    tabs: element(34),
    info: element(32),
    slicePlayer: element(32),
    readout,
    wellMap,
    hud: element(116),
    viewCluster: element(112),
    compass: element(108),
    legend: element(86),
    histogram: element(58),
    details: element(220),
    wellLog: element(720),
    shortcuts: element(360),
    treeCollapsed: false,
    inspectorCollapsed: false,
  };
  elements.details.style.display = "none";
  elements.wellLog.style.display = "none";
  elements.shortcuts.style.display = "none";
  return { root, elements };
}
const px = (value: string) => Number.parseFloat(value);

describe("visualization workbench layout", () => {
  it("reserves one central corridor and separates the top and bottom control rows", () => {
    const { elements } = workbench();
    const button = elements.toolbar.appendChild(
      document.createElement("button"),
    );
    applyChromeOffsets(elements);
    expect(chromeInsets(false, false)).toEqual({ left: 224, right: 280 });
    expect(elements.tree.style.width).toBe("224px");
    expect(elements.inspector.style.width).toBe("280px");
    for (const row of [
      elements.toolbar,
      elements.tabs,
      elements.info,
      elements.slicePlayer,
    ]) {
      expect(px(row.style.left)).toBe(LAYOUT.treeWidth + LAYOUT.gutter);
      expect(px(row.style.right)).toBe(LAYOUT.inspectorWidth + LAYOUT.gutter);
      expect(row.style.boxSizing).toBe("border-box");
    }
    expect(
      px(elements.toolbar.style.top) + px(elements.toolbar.style.height),
    ).toBeLessThan(px(elements.tabs.style.top));
    expect(
      px(elements.tabs.style.top) + px(elements.tabs.style.height),
    ).toBeLessThan(px(elements.viewCluster.style.top));
    expect(
      px(elements.slicePlayer.style.bottom) +
        px(elements.slicePlayer.style.height),
    ).toBeLessThan(px(elements.info.style.bottom));
    expect(button.style.flexShrink).toBe("0");
    expect(elements.toolbar.style.overflowX).toBe("auto");
  });

  it("stacks measured overlays clear of the footer and each other", () => {
    const { elements } = workbench();
    applyChromeOffsets(elements);
    const footerTop =
      px(elements.info.style.bottom) + px(elements.info.style.height);
    expect(px(elements.wellMap.style.bottom)).toBeGreaterThan(footerTop);
    expect(px(elements.readout.style.bottom)).toBeGreaterThanOrEqual(
      px(elements.wellMap.style.bottom) + LAYOUT.wellMapHeight + LAYOUT.gutter,
    );
    expect(px(elements.compass.style.bottom)).toBeGreaterThan(footerTop);
    expect(px(elements.legend.style.bottom)).toBeGreaterThanOrEqual(
      px(elements.compass.style.bottom) +
        elements.compass.offsetHeight +
        LAYOUT.gutter,
    );
    expect(px(elements.histogram.style.bottom)).toBeGreaterThanOrEqual(
      px(elements.legend.style.bottom) +
        elements.legend.offsetHeight +
        LAYOUT.gutter,
    );
    expect(elements.readout.style.visibility).toBe("");
  });

  it("preserves feature visibility and releases space from hidden controls on resize", () => {
    const { elements } = workbench(920, 700);
    elements.inspectorCollapsed = true;
    elements.wellMap.style.display = "none";
    applyChromeOffsets(elements);
    expect(elements.readout.style.visibility).toBe("hidden");
    expect(elements.wellMap.style.display).toBe("none");
    elements.slicePlayer.style.display = "none";
    applyChromeOffsets({
      ...elements,
      containerWidth: 1500,
      containerHeight: 900,
    });
    expect(elements.readout.style.visibility).toBe("");
    expect(elements.wellMap.style.display).toBe("none");
    expect(px(elements.info.style.bottom)).toBe(LAYOUT.gutter);
    expect(px(elements.readout.style.bottom)).toBe(
      LAYOUT.gutter * 2 + LAYOUT.infoHeight,
    );
    expect(elements.slicePlayer.style.display).toBe("none");
  });

  it("prioritizes readable details in short windows without negative or offscreen bounds", () => {
    const { elements } = workbench(1200, 400);
    elements.details.style.display = "block";
    applyChromeOffsets(elements);
    expect(elements.readout.style.visibility).toBe("hidden");
    expect(elements.histogram.style.visibility).toBe("hidden");
    expect(elements.compass.style.visibility).toBe("hidden");
    expect(elements.details.style.display).toBe("block");
    expect(px(elements.details.style.maxHeight)).toBeGreaterThanOrEqual(180);
    expect(
      px(elements.details.style.bottom) + px(elements.details.style.maxHeight),
    ).toBeLessThanOrEqual(400 - LAYOUT.contentTop);
    expect(px(elements.details.style.bottom)).toBeGreaterThan(
      px(elements.info.style.bottom) + px(elements.info.style.height),
    );
  });

  it("keeps a narrow log chart between the tabs and footer without 3D overlays", () => {
    const { elements } = workbench(390, 700);
    Object.assign(elements, responsiveChromeState(390));
    elements.wellLog.style.display = "block";
    applyChromeOffsets(elements);
    expect(elements.tree.style.width).toBe("36px");
    expect(elements.inspector.style.width).toBe("36px");
    expect(elements.toolbar.style.left).toBe("44px");
    expect(elements.toolbar.style.right).toBe("44px");
    expect(elements.wellLog.style.top).toBe(`${LAYOUT.contentTop}px`);
    expect(
      px(elements.wellLog.style.top) +
        px(elements.wellLog.style.height) +
        px(elements.wellLog.style.bottom),
    ).toBe(700);
    expect(px(elements.wellLog.style.maxWidth)).toBe(390 - 44 * 2);
    for (const overlay of [
      elements.readout,
      elements.wellMap,
      elements.hud,
      elements.compass,
      elements.viewCluster,
      elements.legend,
      elements.histogram,
    ])
      expect(overlay.style.visibility).toBe("hidden");
    expect(elements.wellLog.style.display).toBe("block");
  });

  it("navigates only the visible workbench tabs while retaining the legacy default", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const changed = vi.fn();
    const router = new ViewRouter(root, changed);
    root.appendChild(
      router.createTabs(
        ViewRouter.VIEWS.filter((view) => view !== "benchmark"),
      ),
    );
    expect(within(root).queryByRole("tab", { name: "基准测试" })).toBeNull();
    const first = within(root).getByRole("tab", { name: "储层 3D" });
    fireEvent.keyDown(first, { key: "End" });
    const last = within(root).getByRole("tab", { name: "管网" });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: "ArrowRight" });
    expect(first).toHaveFocus();
    expect(changed).toHaveBeenLastCalledWith("reservoir");
    const legacy = new ViewRouter(root).createTabs();
    expect(within(legacy).getByRole("tab", { name: "基准测试" })).toBeDefined();
  });
});
