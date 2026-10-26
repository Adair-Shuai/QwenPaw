import * as THREE from "three";
import {
  downsamplePolyline,
  uniquePolyline,
  visualWellRadius,
} from "./wellClassification";

const WELL_COLOR = 0xf0c14b;

/** Resample point colors onto the rendered tube's arc-length UV coordinates. */
export function applyWellTubeColors(mesh: THREE.Mesh, positions: THREE.BufferAttribute, colors?: THREE.BufferAttribute): void {
  const material = mesh.material as THREE.MeshPhongMaterial;
  const uv = mesh.geometry.getAttribute("uv");
  if (!colors || !uv || colors.count !== positions.count) {
    mesh.geometry.deleteAttribute("color");
    material.vertexColors = false;
    material.color.setHex(WELL_COLOR);
    material.needsUpdate = true;
    return;
  }
  const distances = new Float64Array(positions.count);
  for (let i = 1; i < positions.count; i++) {
    distances[i] = distances[i - 1] + Math.hypot(positions.getX(i) - positions.getX(i - 1), positions.getY(i) - positions.getY(i - 1), positions.getZ(i) - positions.getZ(i - 1));
  }
  const total = distances[distances.length - 1] || 1;
  const output = new Float32Array(uv.count * 3);
  let segment = 0;
  for (let vertex = 0; vertex < uv.count; vertex++) {
    const distance = uv.getX(vertex) * total;
    while (segment < distances.length - 2 && distances[segment + 1] < distance) segment++;
    const next = Math.min(segment + 1, colors.count - 1);
    const fraction = Math.max(0, Math.min(1, (distance - distances[segment]) / (distances[next] - distances[segment] || 1)));
    for (let channel = 0; channel < 3; channel++) {
      output[vertex * 3 + channel] = colors.array[segment * 3 + channel] * (1 - fraction) + colors.array[next * 3 + channel] * fraction;
    }
  }
  mesh.geometry.setAttribute("color", new THREE.BufferAttribute(output, 3));
  material.vertexColors = true;
  material.color.setHex(0xffffff);
  material.needsUpdate = true;
}

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
