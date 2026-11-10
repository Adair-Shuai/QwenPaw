import * as THREE from "three";

export function visitObjectMaterials(
  object: THREE.Object3D | null | undefined,
  visit: (material: THREE.Material) => void,
): void {
  const seen = new Set<THREE.Material>();
  object?.traverse((node) => {
    const material = (node as THREE.Mesh).material;
    for (const item of Array.isArray(material)
      ? material
      : material
      ? [material]
      : []) {
      if (!seen.has(item)) {
        seen.add(item);
        visit(item);
      }
    }
  });
}

/** Dispose each owned GPU resource once, including detached source geometry. */
export function disposeObjectResources(
  object: THREE.Object3D | null,
  extraGeometries: readonly THREE.BufferGeometry[] = [],
): void {
  const geometries = new Set(extraGeometries);
  object?.traverse((node) => {
    const geometry = (node as THREE.Mesh).geometry;
    if (geometry) geometries.add(geometry);
    const element = (node as THREE.Object3D & { element?: HTMLElement })
      .element;
    element?.remove();
  });
  geometries.forEach((geometry) => geometry.dispose());
  visitObjectMaterials(object, (material) => material.dispose());
  object?.parent?.remove(object);
}
