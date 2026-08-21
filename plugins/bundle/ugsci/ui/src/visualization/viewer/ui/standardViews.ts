/**
 * Named camera poses, Z exaggeration and orthographic framing.
 * Matches ResInsight Ctrl-Alt T/B/N/S/E/W and Petrel Z-scale.
 *
 * World axes in this viewer: X easting, Y northing, Z TVD.
 */

import * as THREE from "three";

export type NamedView = "top" | "bottom" | "north" | "south" | "east" | "west" | "iso";

export const NAMED_VIEWS: ReadonlyArray<{ id: NamedView; label: string; shortcut: string }> = [
  { id: "top", label: "Top", shortcut: "Alt+T" },
  { id: "bottom", label: "Bottom", shortcut: "Alt+B" },
  { id: "north", label: "North", shortcut: "Alt+N" },
  { id: "south", label: "South", shortcut: "Alt+S" },
  { id: "east", label: "East", shortcut: "Alt+E" },
  { id: "west", label: "West", shortcut: "Alt+W" },
  { id: "iso", label: "Iso", shortcut: "Alt+I" },
];

export interface ViewPose {
  position: THREE.Vector3;
  up: THREE.Vector3;
}

export function namedViewPose(name: NamedView, target: THREE.Vector3, distance: number): ViewPose {
  const d = Math.max(distance, 1);
  switch (name) {
    case "top":
      return { position: target.clone().add(new THREE.Vector3(0, 0, d)), up: new THREE.Vector3(0, 1, 0) };
    case "bottom":
      return { position: target.clone().add(new THREE.Vector3(0, 0, -d)), up: new THREE.Vector3(0, 1, 0) };
    case "north":
      return { position: target.clone().add(new THREE.Vector3(0, d, 0)), up: new THREE.Vector3(0, 0, 1) };
    case "south":
      return { position: target.clone().add(new THREE.Vector3(0, -d, 0)), up: new THREE.Vector3(0, 0, 1) };
    case "east":
      return { position: target.clone().add(new THREE.Vector3(d, 0, 0)), up: new THREE.Vector3(0, 0, 1) };
    case "west":
      return { position: target.clone().add(new THREE.Vector3(-d, 0, 0)), up: new THREE.Vector3(0, 0, 1) };
    default:
      return {
        position: target.clone().add(new THREE.Vector3(1, 1, 0.8).normalize().multiplyScalar(d)),
        up: new THREE.Vector3(0, 0, 1),
      };
  }
}

export function viewDistanceForBox(box: THREE.Box3, aspect: number, fovDeg: number): number {
  const size = box.getSize(new THREE.Vector3());
  const verticalFov = THREE.MathUtils.degToRad(fovDeg);
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(aspect, 0.2));
  const xy = Math.max(size.x, size.y, 1);
  const z = Math.max(size.z, 1);
  const distanceForWidth = xy * 0.5 / Math.tan(horizontalFov / 2);
  const distanceForHeight = (z + 0.35 * xy) * 0.5 / Math.tan(verticalFov / 2);
  return Math.max(distanceForWidth, distanceForHeight, 1) * 1.2;
}

export function applyOrthographicFrustum(
  camera: THREE.OrthographicCamera,
  distance: number,
  aspect: number,
): void {
  const halfHeight = Math.max(distance * 0.42, 1);
  const halfWidth = halfHeight * Math.max(aspect, 0.2);
  camera.left = -halfWidth;
  camera.right = halfWidth;
  camera.top = halfHeight;
  camera.bottom = -halfHeight;
  camera.near = 0.1;
  camera.far = Math.max(distance * 40, 20_000);
  camera.updateProjectionMatrix();
}

export function cameraAzimuthRad(position: THREE.Vector3, target: THREE.Vector3): number {
  const dx = position.x - target.x;
  const dy = position.y - target.y;
  return Math.atan2(dx, dy);
}

export function metersPerPixel(
  camera: THREE.Camera,
  target: THREE.Vector3,
  viewportHeight: number,
): number {
  if (viewportHeight <= 0) return 1;
  if (camera instanceof THREE.OrthographicCamera) {
    return (camera.top - camera.bottom) / viewportHeight;
  }
  if (camera instanceof THREE.PerspectiveCamera) {
    const distance = camera.position.distanceTo(target);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    return (2 * Math.tan(fov / 2) * distance) / viewportHeight;
  }
  return 1;
}

export const USER_VIEW_KEY = "ugsci.visualization.userView";
