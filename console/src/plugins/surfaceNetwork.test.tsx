import fs from "node:fs";
import path from "node:path";
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
// @ts-expect-error The installed application's geometry module is plain JavaScript.
import * as sceneLod from "../../../plugins/apps/surface-network/src/ezSceneLod.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function openInstalledApplication(fetcher?: typeof fetch) {
  let Page: React.ComponentType | undefined;
  vi.stubGlobal("QwenPaw", {
    host: { React, fetch: fetcher },
    registerRoutes: (
      id: string,
      routes: { path: string; component: React.ComponentType }[],
    ) => {
      expect(id).toBe("surface-network");
      expect(routes[0].path).toBe("/apps/surface-network");
      Page = routes[0].component;
    },
  });
  new Function(
    fs.readFileSync(
      path.resolve("../plugins/apps/surface-network/ui/index.js"),
      "utf8",
    ),
  )();
  if (!Page) throw new Error("Missing application page");
  render(React.createElement(Page as React.ComponentType));
}

it("inspects linked pipes and reverses flow with the selected operating case", () => {
  openInstalledApplication();
  const properties = within(screen.getByRole("complementary"));
  expect(properties.getByText("V01 → CS01")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("运行工况"), {
    target: { value: "1" },
  });
  expect(properties.getByText("CS01 → V01")).toBeTruthy();
  fireEvent.click(properties.getByRole("button", { name: "V01 ↗" }));
  expect(properties.getByRole("heading", { name: "北区阀组" })).toBeTruthy();
  fireEvent.click(properties.getByRole("button", { name: "P-01 ↗" }));
  expect(properties.getByText("V01 → W01")).toBeTruthy();
});

it("opens the station compressor in the shared equipment register and filters its symbols", () => {
  openInstalledApplication();
  fireEvent.click(screen.getByRole("button", { name: "站内工艺" }));
  fireEvent.click(screen.getByRole("button", { name: "注气压缩" }));
  fireEvent.click(screen.getByRole("button", { name: "查看设备图例" }));
  const register = within(screen.getByRole("region", { name: "设备图册" }));
  expect(register.getByRole("heading", { name: "离心压缩机" })).toBeTruthy();
  fireEvent.change(register.getByRole("searchbox"), {
    target: { value: "PSV" },
  });
  fireEvent.click(register.getByRole("button", { name: /安全泄压阀/ }));
  expect(register.getByLabelText("安全泄压阀二维符号")).toBeTruthy();
  expect(register.getByLabelText("安全泄压阀三维模型")).toBeTruthy();
});

it("links sensor tags to measured and modeled values and excludes boundary flows", () => {
  openInstalledApplication();
  const panel = within(screen.getByRole("region", { name: "测点对比" }));
  fireEvent.click(panel.getByRole("button", { name: "定位测点 PT-101" }));
  const properties = within(screen.getByRole("complementary"));
  expect(properties.getByText("0.04 MPa")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "测点 PT-101" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "测点 FT-201" }));
  expect(properties.getByText("边界量")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("运行工况"), {
    target: { value: "1" },
  });
  expect(panel.getAllByText("-37")).toHaveLength(2);
  fireEvent.click(panel.getByRole("button", { name: "定位测点 PT-101" }));
  expect(properties.getByText("0.03 MPa")).toBeTruthy();
});

it("reads the WLP link without replacing the active network drawing", async () => {
  const fetcher = vi.fn(
    async (_url: string | URL | Request, options?: RequestInit) =>
      Response.json(
        options?.method === "POST"
          ? { projectOnly: true, references: ["unit.wlkx"], views: ["站场"] }
          : null,
      ),
  );
  openInstalledApplication(fetcher);
  fireEvent.click(screen.getByRole("button", { name: "eZWalker 工区" }));
  fireEvent.change(screen.getByLabelText("eZWalker 文件"), {
    target: { files: [new File(["sample"], "unit.wlp")] },
  });
  fireEvent.click(screen.getByRole("button", { name: "导入工区" }));
  expect(await screen.findByText(/WLP 引用 unit.wlkx/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "井场集输" }));
  expect(screen.getByRole("button", { name: "定位测点 PT-101" })).toBeTruthy();
});

it("keeps the selected sensor and case across table tabs, drawing focus and reference pages", () => {
  openInstalledApplication();
  fireEvent.change(screen.getByLabelText("运行工况"), {
    target: { value: "1" },
  });
  fireEvent.click(screen.getByRole("button", { name: "定位测点 PT-101" }));
  const diagram = screen.getByRole("group", { name: "二维管网工艺图" });
  const fitted = diagram.getAttribute("viewBox")!;
  fireEvent.click(screen.getByRole("button", { name: "放大一级" }));
  expect(Number(diagram.getAttribute("viewBox")!.split(" ")[2])).toBeLessThan(
    Number(fitted.split(" ")[2]),
  );
  fireEvent.keyDown(diagram, { key: "ArrowLeft" });
  fireEvent.click(screen.getByRole("button", { name: "适合图面" }));
  expect(diagram.getAttribute("viewBox")).toBe(fitted);
  const pipes = screen.getByRole("tab", { name: "管段明细" });
  fireEvent.click(pipes);
  expect(screen.getByRole("table", { name: "管段明细" })).toBeTruthy();
  fireEvent.keyDown(pipes, { key: "Home" });
  expect(
    screen.getByRole("tab", { name: "测点对比" }).getAttribute("aria-selected"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "放大图面" }));
  expect(
    screen
      .getByRole("button", { name: "还原工作台" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  const hostClose = vi.fn();
  window.addEventListener("keydown", hostClose);
  try {
    fireEvent.keyDown(screen.getByRole("button", { name: "还原工作台" }), {
      key: "Escape",
    });
    expect(hostClose).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("button", { name: "放大图面" }), {
      key: "Escape",
    });
    expect(hostClose).toHaveBeenCalledOnce();
  } finally {
    window.removeEventListener("keydown", hostClose);
  }
  expect(screen.getByRole("button", { name: "放大图面" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "设备图册" }));
  fireEvent.click(screen.getByRole("button", { name: "井场集输" }));
  expect((screen.getByLabelText("运行工况") as HTMLSelectElement).value).toBe(
    "1",
  );
  expect(
    within(screen.getByRole("complementary")).getByText("0.03 MPa"),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("tab", { name: "管段明细" }));
  fireEvent.click(screen.getByRole("button", { name: "定位管段 P-07" }));
  expect(
    within(screen.getByRole("complementary")).getByText("P-07"),
  ).toBeTruthy();
});

const worksite = {
  name: "现场集注站.wlkx",
  revision: "current-worksite",
  unit: "m",
  objects: 2,
  fields: 3,
  geometryObjects: 2,
  types: [["站内管线", 2]],
  scene: {
    available: true,
    bounds: [
      [0, 0, 0],
      [20, 12, 3],
    ],
    segments: 2,
    triangles: 0,
    arcs: 1,
    groups: [
      {
        id: "station",
        tree: 1,
        name: "集注站一",
        bounds: [
          [0, 0, 0],
          [20, 12, 3],
        ],
        segments: 2,
      },
    ],
  },
};
function worksiteAxes() {
  const arcOffset = 16 + 2 * 36;
  const bytes = new ArrayBuffer(arcOffset + 52);
  new Uint8Array(bytes, 0, 4).set([69, 90, 83, 49]);
  new DataView(bytes).setUint32(4, 2, true);
  new DataView(bytes).setUint32(12, 1, true);
  for (let n = 0; n < 2; n++) {
    const offset = 16 + n * 36;
    new Uint32Array(bytes, offset, 2).set([1, n + 1]);
    new Float32Array(bytes, offset + 8, 7).set([
      n * 8,
      0,
      0,
      (n + 1) * 8,
      0,
      0,
      0.05,
    ]);
  }
  new Uint32Array(bytes, arcOffset, 2).set([1, 1]);
  new Float32Array(bytes, arcOffset + 8, 11).set([
    8,
    -1,
    0,
    0,
    1,
    0,
    0,
    0,
    1,
    Math.PI / 2,
    0.05,
  ]);
  return bytes;
}

it("opens the saved assembly and locates both objects from a measured face match", async () => {
  const pair = {
    id: 1,
    kind: "contact",
    label: "端面吻合",
    role: "端面",
    status: "candidate",
    field: "装配端面",
    evidence: "端面中心距离 0.3 mm",
    owner: { tree: 1, node: 1, tag: "PG-1" },
    target: { tree: 1, node: 2, tag: "PG-2" },
  };
  const records = {
    available: true,
    count: 1,
    page: 0,
    pageSize: 50,
    rows: [pair],
    types: [{ id: "contact", label: "端面吻合", count: 1 }],
  };
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname.endsWith("/ezwalker")) return Response.json(worksite);
    expect(url.searchParams.get("revision")).toBe(worksite.revision);
    expect(url.searchParams.get("agent_id")).toBe("default");
    if (url.pathname.endsWith("/scene")) return new Response(worksiteAxes());
    if (url.pathname.endsWith("/topology")) return Response.json(records);
    if (url.pathname.endsWith("/object/1/1"))
      return Response.json({
        attributes: [
          ["名称", "进站线"],
          ["位号", "PG-1"],
        ],
        cylinders: "",
        related: records,
      });
    throw Error("Unexpected worksite request " + url.pathname);
  });
  openInstalledApplication(fetcher);
  const plot = within(await screen.findByRole("region", { name: "工区总图" }));
  expect(
    screen
      .getByRole("button", { name: "工区总图" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    plot.getByRole("button", { name: "二维总平" }).getAttribute("aria-pressed"),
  ).toBe("true");
  expect(plot.getByRole("button", { name: "三维全貌" })).toBeTruthy();
  expect(plot.getByRole("option", { name: "集注站一" })).toBeTruthy();
  fireEvent.click(plot.getByRole("button", { name: "放大图面" }));
  const restore = plot.getByRole("button", { name: "还原工作台" });
  expect(restore.getAttribute("aria-pressed")).toBe("true");
  fireEvent.keyDown(restore, { key: "Escape" });
  expect(plot.getByRole("button", { name: "放大图面" })).toBeTruthy();
  const connections = within(
    screen.getByRole("region", { name: "工区连接记录" }),
  );
  fireEvent.click(await connections.findByRole("button", { name: "图上对照" }));
  const comparison = within(await plot.findByLabelText("图上对照"));
  expect(comparison.getByText("PG-1")).toBeTruthy();
  expect(comparison.getByText("PG-2")).toBeTruthy();
  expect(comparison.getByText(/待核对/)).toBeTruthy();
  fireEvent.click(comparison.getByRole("button", { name: "定位两端" }));
  expect((plot.getByLabelText("工区定位范围") as HTMLSelectElement).value).toBe(
    "picked",
  );
  fireEvent.click(plot.getByRole("button", { name: "适合全图" }));
  expect((plot.getByLabelText("工区定位范围") as HTMLSelectElement).value).toBe(
    "all",
  );
  expect(
    await within(
      screen.getByRole("region", { name: "工程对象详情" }),
    ).findByRole("heading", { name: "进站线" }),
  ).toBeTruthy();
});

it("preserves an explicitly selected drawing while the saved worksite is opening", async () => {
  let finish!: (r: Response) => void;
  const response = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  openInstalledApplication(async () => response);
  fireEvent.click(screen.getByRole("button", { name: "井场集输" }));
  await act(async () => {
    finish(Response.json(worksite));
  });
  expect(
    screen
      .getByRole("button", { name: "工区总图" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
  expect(
    screen
      .getByRole("button", { name: "井场集输" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(screen.getByRole("group", { name: "二维管网工艺图" })).toBeTruthy();
});

it("keeps the same worksite scene and station range across directory and drawing navigation", async () => {
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname.endsWith("/ezwalker")) return Response.json(worksite);
    if (url.pathname.endsWith("/scene")) return new Response(worksiteAxes());
    if (url.pathname.endsWith("/topology"))
      return Response.json({
        available: true,
        count: 0,
        rows: [],
        types: [],
        page: 0,
        pageSize: 50,
      });
    if (url.pathname.endsWith("/objects"))
      return Response.json({ count: 0, rows: [] });
    throw Error("Unexpected worksite request " + url.pathname);
  });
  openInstalledApplication(fetcher);
  const plot = await screen.findByRole("region", { name: "工区总图" });
  await screen.findByRole("option", { name: "集注站一" });
  fireEvent.change(within(plot).getByLabelText("工区定位范围"), {
    target: { value: "0" },
  });
  fireEvent.click(screen.getByRole("button", { name: "打开对象目录" }));
  expect(screen.queryByRole("region", { name: "工区总图" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "返回工区总图" }));
  expect(screen.getByRole("region", { name: "工区总图" })).toBe(plot);
  fireEvent.click(screen.getByRole("button", { name: "井场集输" }));
  expect(screen.getByRole("group", { name: "二维管网工艺图" })).toBeTruthy();
  expect(screen.queryByRole("region", { name: "工区总图" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "工区总图" }));
  expect(screen.getByRole("region", { name: "工区总图" })).toBe(plot);
  expect(
    (within(plot).getByLabelText("工区定位范围") as HTMLSelectElement).value,
  ).toBe("0");
  expect(
    fetcher.mock.calls.filter(([url]) => String(url).includes("/scene?")),
  ).toHaveLength(1);
});

it("keeps distinct owners, pipe endpoints and native bend endpoints in the distant view", () => {
  const { makeOverview, spatialOrder } = sceneLod;
  const tubes = new Float32Array([
    1, 1, 0.1, 0.1, 0, 0.2, 0.1, 0, 0.01, 1, 2, 49, 0, 0, 49, 0, 2, 2, 1, 1,
    0.1, 0.1, 0, 0.2, 0.1, 0, 0.01, 1, 3, 0.1, 0.1, 0, 0.2, 0.1, 0, 0.01, 1, 4,
    4, 5, 6, 40, 5, 6, 0.05,
  ]);
  const bounds = [
    [0, 0, -2],
    [52, 12, 8],
  ];
  const data = {
    tubeCoords: tubes,
    tubeOwners: new Float32Array([1, 2, 1, 3, 4]),
    arcCoords: new Float32Array([
      1,
      5,
      3,
      3,
      0,
      5,
      0,
      0,
      0,
      5,
      0,
      Math.PI / 2,
      0.1,
    ]),
    arcOwners: new Float32Array([5]),
    arcExtents: new Float32Array([2.9, 2.9, -0.1, 8.1, 8.1, 0.1]),
    faceCoords: new Float32Array([1, 1, 0, 1, 9, 0, 4, 8, 1]),
    faceOwners: new Float32Array([6, 6, 6]),
    bounds,
  };
  const coarse = makeOverview(data, 2) as {
    points: Float32Array;
    lines: Float32Array;
    faces: Float32Array;
    thickTubes: number[];
  };
  const pointIds = Array.from(coarse.points.filter((_v, i) => i % 4 === 3));
  expect(pointIds.filter((id) => id === 1)).toHaveLength(1);
  expect(pointIds).toContain(3);
  expect(coarse.thickTubes).toEqual([1]);
  expect(Array.from(coarse.lines.slice(0, 8))).toEqual([
    4, 5, 6, 4, 40, 5, 6, 4,
  ]);
  expect(Array.from(coarse.lines.slice(8, 12))).toEqual([8, 3, 0, 5]);
  const last = coarse.lines.slice(-4);
  expect(last[0]).toBeCloseTo(3, 5);
  expect(last[1]).toBeCloseTo(8, 5);
  expect(last[3]).toBe(5);
  expect(Array.from(coarse.faces)).toEqual([
    1, 1, 0, 6, 1, 9, 0, 6, 4, 8, 1, 6,
  ]);
  const order = Array.from(
    spatialOrder(tubes, 9, "tube", bounds) as Uint32Array,
  );
  expect(order.slice(0, 3)).toEqual([0, 2, 3]);
  expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
});
