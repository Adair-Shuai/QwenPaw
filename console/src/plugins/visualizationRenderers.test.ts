import type { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type {
  Mesh,
  BufferGeometry,
  MeshBasicMaterial,
  MeshPhongMaterial,
} from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error Runtime geometry must use the plugin's own Three instance.
import * as THREE from "../../../plugins/bundle/ugsci/ui/node_modules/three/build/three.module.js";
import { createDatasetObject } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/scene/createDatasetObject";
import { disposeObjectResources } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/scene/objectResources";
import type {
  DatasetObject,
  DatasetObjectInput,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/scene/datasetObject";
import type { DatasetInfo } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/contracts/types";
import { computeScalarColors } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/rendering/scalarColors";
import {
  HEX_FILL_INDICES_PER_CELL,
  HEX_FILL_VERTS_PER_CELL,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/hexTopology";
import { preferredDatasetView } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/capabilities/datasetProfile";

const handles: DatasetObject[] = [];
afterEach(() => {
  handles.splice(0).forEach((handle) => handle.dispose());
  vi.restoreAllMocks();
});
const positions = new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]);
const triangles = new Uint32Array([0, 1, 2, 0, 2, 3]);
const pairs = new Uint32Array([0, 1, 1, 2, 2, 3]);
function input(
  source: string,
  overrides: Partial<DatasetObjectInput> = {},
): DatasetObjectInput {
  const dataset: DatasetInfo = {
    id: source,
    name: source,
    source,
    n_vertices: 4,
    n_indices: 6,
    n_cells: 2,
    files: { positions: "p", indices: "i", cell_ids: "ids", scalars: {} },
  };
  return {
    dataset,
    positions,
    indices: triangles,
    origin: [0, 0, 0],
    role: "primary",
    opacity: 0.8,
    wireframe: false,
    wellLabelsVisible: true,
    ...overrides,
  };
}
function create(options: DatasetObjectInput) {
  const handle = createDatasetObject(options);
  handles.push(handle);
  return handle;
}

describe("independent visualization domain renderers", () => {
  it("retains slice converter hex cells and edge filtering while navigating to sections", () => {
    const options = input("slice", {
      positions: new Float32Array([
        0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
      ]),
    });
    options.dataset = {
      ...options.dataset,
      n_cells: 1,
      n_vertices: 8,
      grid_dims: [1, 1, 1],
    };
    expect(preferredDatasetView(options.dataset)).toBe("intersection");
    for (const role of ["primary", "overlay"] as const) {
      const slice = create({ ...options, role });
      expect(slice.hexCorners).toHaveLength(24);
      expect(slice.geometry.getAttribute("position").count).toBe(
        HEX_FILL_VERTS_PER_CELL,
      );
      expect(slice.geometry.getIndex()!.count).toBe(HEX_FILL_INDICES_PER_CELL);
      expect(slice.edges!.geometry.getIndex()!.count).toBe(24);
      slice.setVisibleCells([]);
      expect(slice.geometry.getIndex()!.count).toBe(0);
      expect(slice.edges!.geometry.getIndex()!.count).toBe(0);
      slice.setVisibleCells([0]);
      expect(slice.geometry.getIndex()!.count).toBe(HEX_FILL_INDICES_PER_CELL);
    }
  });
  it("uses the same topology for primary and overlay surface, network and well objects", () => {
    for (const source of [
      "surface",
      "intersection",
      "network",
      "network-tube",
      "wellbore",
      "las",
    ]) {
      const options = input(source, {
        indices: source === "network" ? pairs : triangles,
      });
      const primary = create(options);
      const overlay = create({ ...options, role: "overlay" });
      expect(overlay.geometry.getAttribute("position").array).toEqual(
        primary.geometry.getAttribute("position").array,
      );
      expect(overlay.baseIndices).toEqual(primary.baseIndices);
      if (source === "las") {
        expect(primary.object).toBeNull();
        expect(overlay.object).toBeNull();
      } else {
        expect(overlay.object?.type).toBe(primary.object?.type);
        expect(primary.object?.userData.datasetId).toBe(source);
        expect(primary.geometry).not.toBe(overlay.geometry);
      }
    }
  });

  it("preserves explicit network segments and tube surfaces for actual ray picking", () => {
    const options = input("network", { indices: pairs });
    options.dataset.metadata = { geometry_primitive: "lines" };
    const lines = create(options);
    expect(lines.object).toBeInstanceOf(THREE.LineSegments);
    expect(lines.geometry.getIndex()!.array).toEqual(pairs);
    const old = create(
      input("network", {
        indices: new Uint32Array([0, 1, 0, 1, 2, 1, 2, 3, 2]),
      }),
    );
    expect(old.baseIndices).toEqual(pairs);
    const tube = create(input("network-tube"));
    expect(tube.object).toBeInstanceOf(THREE.Mesh);
    expect(tube.object?.userData.kind).toBe("segment");
    tube.object!.updateMatrixWorld(true);
    const hits = new THREE.Raycaster(
      new THREE.Vector3(0.75, 0.25, 5),
      new THREE.Vector3(0, 0, -1),
    ).intersectObject(tube.object!, true);
    expect(hits).toHaveLength(1);
    expect(hits[0].faceIndex).toBe(0);
    expect(hits[0].point.toArray()).toEqual([0.75, 0.25, 0]);
  });

  it("keeps reservoir fill and edge filtering synchronized without changing source buffers", () => {
    const cube = [
      0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
    ];
    const sourcePositions = new Float32Array([
      ...cube,
      ...cube.map((value, index) => (index % 3 === 0 ? value + 2 : value)),
    ]);
    const before = sourcePositions.slice();
    const options = input("egrid", { positions: sourcePositions });
    options.dataset.n_vertices = 16;
    options.dataset.grid_dims = [2, 1, 1];
    const primary = create(options),
      overlay = create({ ...options, role: "overlay" });
    expect(sourcePositions).toEqual(before);
    expect(primary.geometry.getAttribute("position").count).toBe(
      HEX_FILL_VERTS_PER_CELL * 2,
    );
    expect(primary.baseIndices.length).toBe(HEX_FILL_INDICES_PER_CELL * 2);
    expect(overlay.geometry.getAttribute("normal").array).toEqual(
      primary.geometry.getAttribute("normal").array,
    );
    expect(primary.edges!.visible).toBe(false);
    expect(overlay.edges!.visible).toBe(true);
    primary.setWireframe(true);
    expect(primary.edges!.visible).toBe(true);
    expect(
      (
        primary.object as Mesh<
          BufferGeometry,
          MeshBasicMaterial | MeshPhongMaterial
        >
      ).material.wireframe,
    ).toBe(false);
    primary.setVisibleCells([1]);
    expect(primary.geometry.getIndex()!.array).toEqual(
      primary.baseIndices.slice(HEX_FILL_INDICES_PER_CELL),
    );
    expect(primary.edges!.geometry.getIndex()!.count).toBe(24);
    expect(
      Math.min(...Array.from(primary.edges!.geometry.getIndex()!.array)),
    ).toBe(8);
    primary.setVisibleCells([]);
    expect(primary.geometry.getIndex()!.count).toBe(0);
    expect(primary.edges!.geometry.getIndex()!.count).toBe(0);
    primary.setVisibleCells([0, 1]);
    expect(primary.geometry.getIndex()!.array).toEqual(primary.baseIndices);
    expect(overlay.geometry.getIndex()!.count).toBe(
      HEX_FILL_INDICES_PER_CELL * 2,
    );
  });

  it("rebases overlays against the existing scene origin and keeps depth-only logs unplaced", () => {
    const world = new Float32Array([
      500000, 3000000, -1000, 500040, 3000020, -1200,
    ]);
    const options = input("well", {
      positions: world,
      indices: new Uint32Array([0, 1]),
      origin: [499900, 2999900, -900],
    });
    options.dataset.n_vertices = 2;
    const well = create(options);
    expect(well.localPositions).toEqual(
      new Float32Array([100, 100, -100, 140, 120, -300]),
    );
    expect(
      well.object?.getObjectByName("oilgas-well-label")?.position.toArray(),
    ).toEqual([100, 100, -100]);
    const auto = create({ ...options, origin: undefined });
    expect(auto.origin).toEqual([500020, 3000010, -1100]);
    const log = create({
      ...options,
      dataset: {
        ...options.dataset,
        source: "dlis",
        metadata: { placement: "depth-only" },
      },
    });
    expect(log.object).toBeNull();
    expect(log.origin).toEqual([0, 0, 0]);
    expect(log.geometry.getAttribute("position").array).toEqual(world);
  });

  it("maps real point colors onto the well tube and independently disposes its detached source geometry", () => {
    const handle = create(input("wellbore"));
    expect(handle.baseIndices).toEqual(triangles);
    const tube = handle.object!.getObjectByName("oilgas-well-tube") as Mesh<
      BufferGeometry,
      MeshBasicMaterial | MeshPhongMaterial
    >;
    handle.applyColors(
      new THREE.BufferAttribute(
        new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1]),
        3,
      ),
    );
    expect(tube.material.vertexColors).toBe(true);
    expect(tube.geometry.getAttribute("color").count).toBe(
      tube.geometry.getAttribute("position").count,
    );
    expect(
      Array.from(tube.geometry.getAttribute("color").array).every(
        Number.isFinite,
      ),
    ).toBe(true);
    handle.applyColors();
    expect(tube.material.vertexColors).toBe(false);
    expect(tube.geometry.getAttribute("color")).toBeUndefined();
    const sourceDispose = vi.spyOn(handle.geometry, "dispose"),
      tubeDispose = vi.spyOn(tube.geometry, "dispose"),
      materialDispose = vi.spyOn(tube.material, "dispose");
    const scene = new THREE.Scene();
    scene.add(handle.object!);
    const label = handle.object!.getObjectByName(
      "oilgas-well-label",
    ) as CSS2DObject;
    document.body.appendChild(label.element);
    handle.dispose();
    handle.dispose();
    expect(sourceDispose).toHaveBeenCalledOnce();
    expect(tubeDispose).toHaveBeenCalledOnce();
    expect(materialDispose).toHaveBeenCalledOnce();
    expect(scene.children).toHaveLength(0);
    expect(label.element.isConnected).toBe(false);
  });

  it("applies cell scalar colors to real surface triangles while retaining colors through filtering", () => {
    const handle = create(input("surface"));
    const colors = computeScalarColors(
      new Float32Array([10, 30]),
      handle.baseIndices,
      "viridis",
      4,
      "cell",
    );
    handle.applyColors(new THREE.BufferAttribute(colors.colors, 3));
    const material = (
      handle.object as Mesh<
        BufferGeometry,
        MeshBasicMaterial | MeshPhongMaterial
      >
    ).material;
    expect(material.vertexColors).toBe(true);
    expect(material.color.getHex()).toBe(0xffffff);
    handle.setVisibleCells([1]);
    expect(handle.geometry.getIndex()!.array).toEqual(
      new Uint32Array([0, 2, 3]),
    );
    expect(handle.geometry.getAttribute("color").array).toEqual(colors.colors);
    handle.setOpacity(0.25);
    expect(material.opacity).toBe(0.25);
    handle.setWireframe(true);
    expect(material.wireframe).toBe(true);
  });

  it("honors explicit line primitives for surface and legacy source-less datasets", () => {
    for (const source of ["surface", ""]) {
      const options = input(source, { indices: pairs });
      options.dataset.metadata = { geometry_primitive: "lines" };
      expect(create(options).object).toBeInstanceOf(THREE.LineSegments);
      expect(create({ ...options, role: "overlay" }).object).toBeInstanceOf(
        THREE.Line,
      );
    }
  });

  it("releases shared geometry and material once and leaves another handle usable", () => {
    const geometry = new THREE.BoxGeometry(),
      material = new THREE.MeshPhongMaterial();
    const root = new THREE.Group();
    root.add(
      new THREE.Mesh(geometry, material),
      new THREE.Mesh(geometry, material),
    );
    const geometryDispose = vi.spyOn(geometry, "dispose"),
      materialDispose = vi.spyOn(material, "dispose");
    disposeObjectResources(root, [geometry]);
    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(materialDispose).toHaveBeenCalledOnce();
    const first = create(input("surface")),
      second = create(input("surface"));
    const survivor = vi.spyOn(second.geometry, "dispose");
    first.dispose();
    expect(survivor).not.toHaveBeenCalled();
    second.setVisibleCells([0]);
    expect(second.geometry.getIndex()!.count).toBe(3);
  });
});
