import * as THREE from "three";
import {
  downsamplePolyline,
  uniquePolyline,
  visualWellRadius,
} from "./wellClassification";

const WELL_COLOR = 0xf0c14b;

export function buildWellTubeMesh(
  localPositions: Float32Array,
  radius?: number,
): THREE.Mesh | null {
  const points = downsamplePolyline(uniquePolyline(localPositions), 256);
  if (points.length < 2) return null;
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "catmullrom",
    0.15,
  );
  const tubeRadius = radius ?? visualWellRadius(points);
  const tubularSegments = Math.min(192, Math.max(12, (points.length - 1) * 4));
  const geometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    tubeRadius,
    8,
    false,
  );
  const material = new THREE.MeshPhongMaterial({
    color: WELL_COLOR,
    emissive: new THREE.Color(0x3a2a08),
    specular: new THREE.Color(0x222222),
    shininess: 18,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "oilgas-well-tube";
  return mesh;
}
