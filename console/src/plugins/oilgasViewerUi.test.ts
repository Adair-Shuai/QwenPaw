import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, waitFor, within } from "@testing-library/react";
import {
  createBoolSwitch,
  createControlTable,
  createInspectorTabs,
  appendControlRow,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/inspectorTabs";
import { renderComponentTree } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/componentTree";
import {
  createSlicePlayer,
  sliceRangeText,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/slicePlayer";
import {
  closeContextMenu,
  showContextMenu,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/contextMenu";
import {
  importLocalFiles,
  importWorkspaceFile,
  openWorkspacePicker,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/importDialog";
import { classifyPickedFiles } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/importFormats";
import {
  applyChromeOffsets,
  responsiveChromeState,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/layout";
import {
  createReadoutPanel,
  updateReadout,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/readout";
import type { DatasetInfo } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/contracts/types";

const cleanupCallbacks: Array<() => void> = [];
const originalHost = (window as unknown as { QwenPaw?: unknown }).QwenPaw;
afterEach(() => {
  cleanupCallbacks.splice(0).forEach((close) => close());
  document.body.replaceChildren();
  (window as unknown as { QwenPaw?: unknown }).QwenPaw = originalHost;
  vi.restoreAllMocks();
});

const append = () => document.body.appendChild(document.createElement("div"));
const response = (
  entries: unknown[],
  more = false,
  cursor: string | null = null,
) =>
  new Response(
    JSON.stringify({
      directory: "",
      entries,
      has_more: more,
      next_cursor: cursor,
    }),
  );
const host = (container: HTMLElement) => ({
  container,
  apiBase: "/api/ugsci/visualization",
  request: ((...args: Parameters<typeof fetch>) =>
    (
      window as unknown as { QwenPaw: { host: { fetch: typeof fetch } } }
    ).QwenPaw.host.fetch(...args)) as typeof fetch,
  onStatus: vi.fn(),
  onImported: vi.fn().mockResolvedValue(undefined),
});
const setFetch = (fetch: (...args: any[]) => Promise<Response>) =>
  Object.assign(window, { QwenPaw: { host: { fetch } } });
const grid: DatasetInfo = {
  id: "reservoir",
  name: "测试气藏",
  n_vertices: 8,
  n_cells: 1,
  n_indices: 36,
  grid_dims: [1, 1, 1],
  files: { positions: "p", indices: "i", cell_ids: "c", scalars: {} },
};

describe("Oilgas viewer UI behavior", () => {
  it("localizes inspector controls and switches tabs by keyboard without duplicate ARIA IDs", () => {
    const root = append();
    const first = createInspectorTabs();
    const second = createInspectorTabs();
    root.append(
      first.tabBar,
      ...Object.values(first.panes),
      second.tabBar,
      ...Object.values(second.panes),
    );
    const tabs = within(first.tabBar);
    expect(tabs.getByRole("tab", { name: /属性/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.keyDown(tabs.getByRole("tab", { name: /属性/ }), {
      key: "ArrowRight",
    });
    expect(first.active()).toBe("actions");
    expect(tabs.getByRole("tab", { name: /操作/ })).toHaveFocus();
    expect(first.panes.actions).toBeVisible();
    expect(first.panes.controls).not.toBeVisible();
    const ids = Array.from(root.querySelectorAll("[id]")).map(
      (node) => node.id,
    );
    expect(new Set(ids).size).toBe(ids.length);
    const { table, body } = createControlTable();
    root.append(table);
    const change = vi.fn();
    const control = createBoolSwitch("test-wireframe", false, change);
    appendControlRow(body, "显示网格线", control);
    fireEvent.click(within(control).getByRole("button", { name: "开启" }));
    fireEvent.click(within(control).getByRole("button", { name: "开启" }));
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    expect(
      within(control).getByRole("button", { name: "开启" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(root.textContent).toContain("项目设置");
    expect(root.textContent).not.toMatch(/Controls|Actions|Addons|False|True/);
  });

  it("renders matching objects inside folded groups and exposes real keyboard-selectable controls", () => {
    const list = append();
    const selected = vi.fn();
    const visibility = vi.fn();
    renderComponentTree(list, [grid], {
      query: "测试气藏",
      activeId: null,
      selectedId: null,
      visibleIds: new Set(),
      collapsedGroups: new Set(["grids"]),
      onToggleGroup: vi.fn(),
      onToggleVisible: visibility,
      onSelect: selected,
      onFocus: vi.fn(),
    });
    fireEvent.click(
      within(list).getByRole("button", { name: "选择 测试气藏" }),
    );
    expect(selected).toHaveBeenCalledExactlyOnceWith(grid);
    fireEvent.click(
      within(list).getByRole("checkbox", { name: "显示/隐藏 测试气藏" }),
    );
    expect(visibility).toHaveBeenCalledExactlyOnceWith(grid, true);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(within(list).getByRole("button", { name: /网格/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(list.textContent).not.toContain("cells");
  });

  it("rejects invalid slice dimensions, clamps indices, and stops playback when data changes", () => {
    const onPlay = vi.fn();
    const onIndex = vi.fn();
    const onAxis = vi.fn();
    const player = createSlicePlayer({ onPlay, onIndex, onAxis });
    append().append(player.root);
    const ui = within(player.root);
    expect(ui.getByRole("slider", { name: "切片层号" })).toBeDisabled();
    player.setDims([10, 20, 30]);
    fireEvent.click(ui.getByRole("button", { name: "沿 I 方向切片" }));
    player.setIndex(999);
    expect(onIndex).toHaveBeenLastCalledWith("i", 10);
    player.setIndex(NaN);
    expect(onIndex).toHaveBeenLastCalledWith("i", 1);
    fireEvent.click(ui.getByRole("button", { name: "沿 I/J/K 播放" }));
    expect(onPlay).toHaveBeenLastCalledWith(true);
    player.setDims([Infinity, 2, 3]);
    expect(onPlay).toHaveBeenLastCalledWith(false);
    expect(onAxis).toHaveBeenLastCalledWith(null);
    expect(player.axis()).toBeNull();
    expect(ui.getByRole("slider")).toBeDisabled();
    expect(sliceRangeText(Infinity)).toBe("1:1");
  });

  it("cleans up context-menu listeners on selection and replacement and isolates keyboard shortcuts", () => {
    const root = append();
    const onPick = vi.fn();
    const remove = vi.spyOn(window, "removeEventListener");
    const key = vi.fn();
    window.addEventListener("keydown", key);
    cleanupCallbacks.push(() => {
      closeContextMenu(root);
      window.removeEventListener("keydown", key);
    });
    showContextMenu(
      root,
      -20,
      -20,
      [
        { id: "focus", label: "聚焦" },
        { id: "hide", label: "隐藏" },
      ],
      onPick,
    );
    const menu = within(root).getByRole("menu");
    expect(parseFloat(menu.style.left)).toBeGreaterThanOrEqual(8);
    fireEvent.keyDown(within(menu).getByRole("menuitem", { name: "聚焦" }), {
      key: "ArrowDown",
    });
    expect(within(menu).getByRole("menuitem", { name: "隐藏" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "Delete" });
    expect(key).not.toHaveBeenCalled();
    fireEvent.click(within(menu).getByRole("menuitem", { name: "隐藏" }));
    expect(onPick).toHaveBeenCalledExactlyOnceWith("hide");
    expect(root.querySelector("[role=menu]")).toBeNull();
    expect(remove).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
      true,
    );
    showContextMenu(root, 0, 0, [{ id: "focus", label: "聚焦" }], onPick);
    showContextMenu(root, 0, 0, [{ id: "focus", label: "聚焦" }], onPick);
    expect(root.querySelectorAll("[role=menu]")).toHaveLength(1);
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(root.querySelector("[role=menu]")).toBeNull();
  });

  it("ignores stale workspace responses after changing roots and restores focus on Escape", async () => {
    const root = append();
    const trigger = document.createElement("button");
    root.append(trigger);
    trigger.focus();
    let resolveProject!: (response: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveProject = resolve;
          }),
      )
      .mockResolvedValueOnce(
        response([{ kind: "file", name: "new.LAS", path: "new.LAS" }]),
      );
    setFetch(fetch);
    cleanupCallbacks.push(openWorkspacePicker(host(root)));
    fireEvent.click(within(root).getByRole("button", { name: "Agent 工作区" }));
    await waitFor(() => expect(root.textContent).toContain("new.LAS"));
    resolveProject(
      response([{ kind: "file", name: "stale.EGRID", path: "stale.EGRID" }]),
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(root.textContent).not.toContain("stale.EGRID");
    expect(within(root).getByRole("button", { name: "上级" })).toBeDisabled();
    fireEvent.keyDown(within(root).getByRole("dialog"), { key: "Escape" });
    expect(root.querySelector("[role=dialog]")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("keeps earlier workspace entries after a page failure and removes obsolete empty states", async () => {
    const root = append();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        response(
          [{ kind: "file", name: "notes.txt", path: "notes.txt" }],
          true,
          "a",
        ),
      )
      .mockResolvedValueOnce(
        response(
          [{ kind: "file", name: "first.LAS", path: "first.LAS" }],
          true,
          "b",
        ),
      )
      .mockRejectedValueOnce(new Error("网络暂不可用"))
      .mockResolvedValueOnce(
        response([{ kind: "file", name: "second.LAS", path: "second.LAS" }]),
      );
    setFetch(fetch);
    cleanupCallbacks.push(openWorkspacePicker(host(root)));
    await waitFor(() => expect(root.textContent).toContain("此目录没有可导入"));
    fireEvent.click(within(root).getByRole("button", { name: "加载更多" }));
    await waitFor(() => expect(root.textContent).toContain("first.LAS"));
    expect(root.textContent).not.toContain("此目录没有可导入");
    fireEvent.click(within(root).getByRole("button", { name: "加载更多" }));
    await waitFor(() => expect(root.textContent).toContain("网络暂不可用"));
    expect(root.textContent).toContain("first.LAS");
    fireEvent.click(within(root).getByRole("button", { name: "重试读取" }));
    await waitFor(() => expect(root.textContent).toContain("second.LAS"));
    expect(root.textContent).toContain("first.LAS");
    expect(fetch.mock.calls[3][0]).toContain("cursor=b");
  });

  it("does not attach a different model or a second independent file as a companion", () => {
    const a = new File([""], "a.EGRID");
    const b = new File([""], "b.INIT");
    const well = new File([""], "a.LAS");
    const own = new File([""], "A.INIT");
    expect(classifyPickedFiles([a, b, well])).toEqual({
      primary: a,
      companion: undefined,
      extra: [well, b],
    });
    expect(classifyPickedFiles([a, b, own])?.companion).toBe(own);
    const second = new File([""], "second.LAS");
    expect(classifyPickedFiles([well, second])?.companion).toBeUndefined();
  });

  it("keeps instance scope for upload, workspace import and status polling without retrying a failed submission", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ job_id: "one" })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "completed",
            progress: 1,
            result: { id: "grid" },
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ job_id: "two" })))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            status: "completed",
            progress: 1,
            result: { id: "well" },
          }),
        ),
      )
      .mockRejectedValueOnce(new Error("连接已断开"));
    const scoped = {
      ...host(append()),
      request: request as typeof fetch,
      headers: { "X-Agent-ID": "isolated-agent" },
      authToken: "instance-token",
    };
    await importLocalFiles(scoped, [new File(["content"], "case.EGRID")]);
    await importWorkspaceFile(scoped, "well.LAS", "workspace");
    expect(scoped.onImported.mock.calls).toEqual([["grid"], ["well"]]);
    for (const [, options] of request.mock.calls) {
      expect(new Headers(options.headers).get("X-Agent-ID")).toBe(
        "isolated-agent",
      );
      expect(new Headers(options.headers).get("Authorization")).toBe(
        "Bearer instance-token",
      );
    }
    await expect(
      importWorkspaceFile(scoped, "well.LAS", "workspace"),
    ).rejects.toThrow("连接已断开");
    expect(request).toHaveBeenCalledTimes(5);
  });

  it("uses container-width breakpoints and preserves overlay display state across resizing", () => {
    expect(responsiveChromeState(920)).toEqual({
      treeCollapsed: false,
      inspectorCollapsed: true,
    });
    expect(responsiveChromeState(600)).toEqual({
      treeCollapsed: true,
      inspectorCollapsed: true,
    });
    const tree = append();
    const inspector = append();
    const toolbar = append();
    const button = toolbar.appendChild(document.createElement("button"));
    button.textContent = "导入模型";
    const readout = append();
    readout.style.display = "none";
    applyChromeOffsets({
      tree,
      inspector,
      toolbar,
      readout,
      treeCollapsed: false,
      inspectorCollapsed: true,
      containerWidth: 920,
      containerHeight: 700,
    });
    expect(toolbar.style.overflowX).toBe("auto");
    expect(button.style.whiteSpace).toBe("nowrap");
    expect(readout.style.visibility).toBe("hidden");
    expect(readout.style.display).toBe("none");
    applyChromeOffsets({
      tree,
      inspector,
      toolbar,
      readout,
      treeCollapsed: false,
      inspectorCollapsed: false,
      containerWidth: 1500,
      containerHeight: 900,
    });
    expect(readout.style.visibility).toBe("");
    expect(readout.style.display).toBe("none");
  });

  it("labels raw coordinates without claiming their vertical value is measured depth", () => {
    const panel = createReadoutPanel();
    append().append(panel);
    updateReadout(panel, {
      hover: [100, 200, NaN],
      selectedLabel: "气藏",
      selectedMeta: "单元 1",
      pickKind: "cell",
    });
    expect(panel.textContent).toContain("东向 X");
    expect(panel.textContent).toContain("北向 Y");
    expect(panel.textContent).toContain("垂向 Z");
    expect(panel.textContent).not.toMatch(/SELECTED|READOUT|TVD|NaN/);
  });
});
