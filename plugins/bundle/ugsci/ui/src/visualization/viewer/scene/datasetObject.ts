import * as THREE from "three";
import type { DatasetInfo } from "../contracts/types";
import type { ModelOrigin } from "./geometry";
import {
  disposeObjectResources,
  visitObjectMaterials,
} from "./objectResources";

export interface DatasetObjectInput {
  dataset: DatasetInfo;
  positions: Float32Array;
  indices: Uint32Array;
  origin?: ModelOrigin;
  role: "primary" | "overlay";
  opacity: number;
  wireframe: boolean;
  wellLabelsVisible: boolean;
}

export interface DatasetObject {
  readonly object: THREE.Object3D | null;
  /** The unfiltered source topology used for scalar association and cell picking. */
  readonly geometry: THREE.BufferGeometry;
  readonly baseIndices: Uint32Array;
  readonly origin: ModelOrigin;
  readonly localPositions: Float32Array;
  readonly hexCorners: Float32Array | null;
  readonly edges: THREE.LineSegments | null;
  applyColors(colors?: THREE.BufferAttribute): void;
  setOpacity(value: number): void;
  setWireframe(enabled: boolean): void;
  setVisibleCells(offsets: readonly number[]): void;
  dispose(): void;
}

interface ObjectParts {
  object: THREE.Object3D | null;
  geometry: THREE.BufferGeometry;
  baseIndices: Uint32Array;
  origin: ModelOrigin;
  localPositions: Float32Array;
  cellCount: number;
  hexCorners?: Float32Array | null;
  edges?: THREE.LineSegments | null;
  applyColors?: (colors?: THREE.BufferAttribute) => void;
  setWireframe?: (enabled: boolean) => void;
  setVisibleCells?: (offsets: readonly number[]) => void;
}

/** Composition boundary: domain callbacks own their geometry, never the engine. */
export function datasetObject(parts: ObjectParts): DatasetObject {
  let disposed = false;
  return {
    object: parts.object,
    geometry: parts.geometry,
    baseIndices: parts.baseIndices,
    origin: parts.origin,
    localPositions: parts.localPositions,
    hexCorners: parts.hexCorners ?? null,
    edges: parts.edges ?? null,
    applyColors(colors) {
      if (disposed) return;
      if (colors) parts.geometry.setAttribute("color", colors);
      else parts.geometry.deleteAttribute("color");
      parts.applyColors?.(colors);
    },
    setOpacity(value) {
      if (disposed) return;
      visitObjectMaterials(parts.object, (material) => {
        material.opacity = value;
        material.transparent = value < 0.999;
        material.needsUpdate = true;
      });
    },
    setWireframe(enabled) {
      if (!disposed) parts.setWireframe?.(enabled);
    },
    setVisibleCells(offsets) {
      if (disposed) return;
      const perCell = parts.baseIndices.length / parts.cellCount;
      if (!Number.isInteger(perCell) || perCell <= 0) return;
      const indices = new Uint32Array(offsets.length * perCell);
      offsets.forEach((offset, index) => {
        indices.set(
          parts.baseIndices.subarray(offset * perCell, (offset + 1) * perCell),
          index * perCell,
        );
      });
      parts.geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      parts.setVisibleCells?.(offsets);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      disposeObjectResources(parts.object, [parts.geometry]);
    },
  };
}

export function applyMaterialColors(
  material: THREE.MeshPhongMaterial | THREE.LineBasicMaterial,
  colors: THREE.BufferAttribute | undefined,
  fallback: number,
): void {
  material.vertexColors = Boolean(colors);
  material.color.setHex(colors ? 0xffffff : fallback);
  material.needsUpdate = true;
}
