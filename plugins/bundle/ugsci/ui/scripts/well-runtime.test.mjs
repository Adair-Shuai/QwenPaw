import assert from "node:assert/strict";
import test from "node:test";
import { GeneratorRegistry, unpackBufferGeometry } from "@equinor/videx-3d/sdk";
import { generateBasicTrajectory, generateCasings } from "@equinor/videx-3d/generators";
import { BoxGeometry, BufferGeometry, FrontSide, Mesh, MeshBasicMaterial, Ray, Raycaster, Vector3 } from "three";
import { MeshBVHUniformStruct, SAH, acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";

const measuredDepth = 500;
const casingItems = [
  { type: "surface", mdTopMsl: 0, mdBottomMsl: 100, outerDiameter: 0.34, innerDiameter: 0.31 },
  { type: "intermediate", mdTopMsl: 0, mdBottomMsl: 300, outerDiameter: 0.245, innerDiameter: 0.22 },
  { type: "production", mdTopMsl: 0, mdBottomMsl: 500, outerDiameter: 0.178, innerDiameter: 0.159 },
];

function close(actual, expected, message, tolerance = 1e-4) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);
}

function finite(values, message) {
  assert.ok(values.length > 0, `${message} is empty`);
  assert.ok(Array.from(values).every(Number.isFinite), `${message} contains a non-finite value`);
}

function wellFixture(deviated) {
  const positions = [0, 0, 0, 0];
  let x = 0;
  let tvd = 0;
  for (let md = 25; md <= measuredDepth; md += 25) {
    const angle = deviated ? Math.min(60, Math.max(0, (md - 100) / 3)) * Math.PI / 180 : 0;
    x += 25 * Math.sin(angle);
    tvd += 25 * Math.cos(angle);
    // VidEx input uses positive TVD; output Three geometry uses negative Y.
    positions.push(x, tvd, 0, md);
  }
  const records = {
    "position-logs": { well: Float32Array.from(positions) },
    casings: { well: casingItems.map((item) => ({ ...item, properties: { Type: item.type } })) },
  };
  const store = {
    async get(type, key) { return records[type]?.[key] ?? null; },
    async all(type) { return Object.values(records[type] ?? {}); },
    async query(type, query) {
      return Object.values(records[type] ?? {}).filter((item) =>
        Object.entries(query).every(([key, value]) => item[key] === value));
    },
  };
  const registry = new GeneratorRegistry({}, store);
  registry.add("casings", generateCasings);
  registry.add("trajectory", generateBasicTrajectory);
  return { registry, x, tvd };
}

for (const deviated of [false, true]) {
  test(`VidEx generates finite ${deviated ? "deviated" : "vertical"} well geometry and three casing layers`, async (t) => {
    const { registry, x, tvd } = wellFixture(deviated);
    const packed = await registry.invoke("trajectory", "well", 0.05, 0, undefined, true);
    assert.ok(packed, "trajectory generator returned no data");
    const geometry = unpackBufferGeometry(packed);
    t.after(() => geometry.dispose());
    assert.ok(geometry instanceof BufferGeometry, "decoded geometry must use the shared Three runtime");
    const position = geometry.getAttribute("position");
    assert.ok(position.count > 2);
    for (const [name, attribute] of Object.entries(geometry.attributes)) finite(attribute.array, name);
    close(position.getX(0), 0, "wellhead X");
    close(position.getY(0), 0, "wellhead Y");
    close(position.getX(position.count - 1), x, "bottom X");
    close(position.getY(position.count - 1), -tvd, "bottom TVD");
    const lengths = geometry.getAttribute("lengths");
    close(lengths.getX(0), 0, "first normalized MD");
    close(lengths.getX(lengths.count - 1), 1, "last normalized MD");
    for (let index = 1; index < lengths.count; index++) {
      assert.ok(lengths.getX(index) >= lengths.getX(index - 1), "MD must increase along trajectory");
    }
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    finite(geometry.boundingBox.min.toArray(), "minimum bounds");
    finite(geometry.boundingBox.max.toArray(), "maximum bounds");
    assert.ok(Number.isFinite(geometry.boundingSphere.radius) && geometry.boundingSphere.radius > 0);
    close(geometry.boundingBox.min.y, -tvd, "minimum depth");
    close(geometry.boundingBox.max.y, 0, "maximum depth");
    if (deviated) {
      assert.ok(geometry.boundingBox.max.x > 200, "deviated well must move laterally");
      assert.ok(tvd < measuredDepth, "deviated TVD must be less than MD");
    } else {
      close(geometry.boundingBox.max.x - geometry.boundingBox.min.x, 0, "vertical lateral extent");
      close(tvd, measuredDepth, "vertical TVD equals MD");
    }

    const sections = await registry.invoke("casings", "well", undefined, 2, 0.05, 0);
    assert.equal(sections.length, casingItems.length);
    assert.deepEqual(new Set(sections.map((section) => section.type)), new Set(casingItems.map((item) => item.type)));
    for (const section of sections) {
      const source = casingItems.find((item) => item.type === section.type);
      close(section.radius, source.outerDiameter / 2, `${section.type} outer radius`);
      close(section.innerRadius, source.innerDiameter / 2, `${section.type} inner radius`);
      assert.ok(section.innerRadius > 0 && section.innerRadius < section.radius);
      close(section.top, 0, `${section.type} top MD fraction`);
      close(section.bottom, source.mdBottomMsl / measuredDepth, `${section.type} bottom MD fraction`);
      close(section.length, source.mdBottomMsl, `${section.type} length`);
      finite(section.attributesBuffer, `${section.type} casing frames`);
      assert.ok(section.segments >= 2);
      assert.equal(section.attributesBuffer.length, section.segments * 12);
      close(section.attributesBuffer[10], section.top, `${section.type} first frame MD`);
      close(section.attributesBuffer.at(-2), section.bottom, `${section.type} last frame MD`);
      const center = new Vector3(...section.boundingSphere.center);
      assert.ok(Number.isFinite(section.boundingSphere.radius) && section.boundingSphere.radius > 0);
      for (let offset = 0; offset < section.attributesBuffer.length; offset += 12) {
        const point = new Vector3().fromArray(section.attributesBuffer, offset);
        assert.ok(point.distanceTo(center) <= section.boundingSphere.radius + 1e-3, "casing frame lies outside its bounds");
        assert.ok(section.attributesBuffer[offset + 11] > 0, "casing frame radius must be positive");
      }
    }
    const clipped = await registry.invoke("casings", "well", 200, 2, 0.05, 0);
    assert.deepEqual(new Set(clipped.map((section) => section.type)), new Set(["intermediate", "production"]));
    for (const section of clipped) {
      close(section.top, 0.4, "clipped top MD fraction");
      assert.ok(section.bottom > section.top);
      finite(section.attributesBuffer, "clipped casing frames");
    }
  });
}

test("BVH preserves Three ray hits, updates GPU uniforms, and restores normal raycasting after disposal", (t) => {
  const geometry = new BoxGeometry(2, 2, 2);
  // GPU BVH uniforms support one root; this mesh uses one material for all faces.
  geometry.clearGroups();
  const material = new MeshBasicMaterial();
  const mesh = new Mesh(geometry, material);
  mesh.position.set(3, 0, 0);
  mesh.updateMatrixWorld(true);
  t.after(() => { geometry.dispose(); material.dispose(); });
  const raycaster = new Raycaster(new Vector3(3.2, 0.3, 5), new Vector3(0, 0, -1));
  const baseline = raycaster.intersectObject(mesh, false)[0];
  assert.ok(baseline);
  close(baseline.distance, 4, "baseline distance to front face");

  // These are the instance methods and options used by Drei's Bvh component.
  geometry.computeBoundsTree = computeBoundsTree;
  geometry.disposeBoundsTree = disposeBoundsTree;
  geometry.computeBoundsTree({ strategy: SAH, maxDepth: 40, maxLeafTris: 1, indirect: false, setBoundingBox: true, verbose: false });
  assert.ok(geometry.boundsTree);
  const localHit = geometry.boundsTree.raycastFirst(new Ray(new Vector3(0.2, 0.3, 5), new Vector3(0, 0, -1)), FrontSide);
  assert.ok(localHit);
  close(localHit.distance, 4, "local BVH distance");
  close(localHit.point.z, 1, "local BVH front face");
  close(localHit.face.normal.z, 1, "local BVH face normal");

  mesh.raycast = acceleratedRaycast;
  raycaster.firstHitOnly = true;
  const hits = raycaster.intersectObject(mesh, false);
  assert.equal(hits.length, 1);
  close(hits[0].distance, baseline.distance, "accelerated world distance");
  assert.ok(hits[0].point.distanceTo(baseline.point) < 1e-6);
  close(hits[0].face.normal.z, 1, "accelerated face normal");

  const uniforms = new MeshBVHUniformStruct();
  uniforms.updateFrom(geometry.boundsTree);
  const textures = [uniforms.position, uniforms.index, uniforms.bvhBounds, uniforms.bvhContents];
  let disposedTextures = 0;
  for (const texture of textures) {
    assert.ok(texture.image.width > 0 && texture.image.height > 0);
    finite(texture.image.data, "BVH shader texture");
    texture.addEventListener("dispose", () => disposedTextures++);
  }
  const firstVertex = new Vector3().fromBufferAttribute(geometry.getAttribute("position"), 0);
  assert.ok(new Vector3().fromArray(uniforms.position.image.data).distanceTo(firstVertex) < 1e-6);
  assert.deepEqual(Array.from(uniforms.index.image.data.slice(0, 3)), Array.from(geometry.index.array.slice(0, 3)));
  uniforms.dispose();
  assert.equal(disposedTextures, 4, "all GPU uniform textures must be disposed");

  geometry.disposeBoundsTree();
  assert.equal(geometry.boundsTree, null);
  mesh.raycast = Mesh.prototype.raycast;
  delete raycaster.firstHitOnly;
  const restoredHit = raycaster.intersectObject(mesh, false)[0];
  assert.ok(restoredHit);
  close(restoredHit.distance, baseline.distance, "restored normal raycast distance");
  assert.ok(restoredHit.point.distanceTo(baseline.point) < 1e-6);
});
