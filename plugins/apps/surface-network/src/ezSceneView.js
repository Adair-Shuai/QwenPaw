import * as T from "three";
import { makeOverview, spatialOrder } from "./ezSceneLod.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { arcRadius, curveSteps, maxCurveSteps } from "./ezCurves.js";

// Render a finite cylinder on a single instanced quad. A plant can contain
// hundreds of thousands of cylinders; its actual radius and end planes still
// determine the silhouette and depth at every zoom level.
const segmentInputs = `
attribute float radius; attribute float asset;
uniform float pixel; uniform bool picking; uniform bool hideContext;
varying vec4 shape; varying vec3 point; varying vec2 orientation; varying float objectId;
`;
const projectSegment = `
  objectId=asset;
  if(hideContext && asset==0.0) {gl_Position=vec4(2.,2.,2.,1.);return;}
  vec3 a=(modelViewMatrix*vec4(start,1.)).xyz, b=(modelViewMatrix*vec4(end,1.)).xyz;
  vec3 axis=b-a;
  float length3=max(length(axis),1.e-15), xy=length(axis.xy);
  vec2 along=xy>1.e-12 ? axis.xy/xy : vec2(1.,0.);
  vec2 side=vec2(-along.y,along.x);
  float r=max(radius,pixel*(picking?2.8:0.55));
  float px=mix(-r,xy+r,position.x);
  vec2 offset=along*px+side*(position.y*r);
  shape=vec4(xy/length3,axis.z/length3,length3/r,r);
  point=vec3(px/r,position.y,a.z); orientation=along;
  gl_Position=projectionMatrix*vec4(a.xy+offset,mix(a.z,b.z,position.x),1.);
}`;
const tubeVertex =
  segmentInputs +
  `
attribute vec3 start; attribute vec3 end;
void main() {` +
  projectSegment;
const arcVertex =
  segmentInputs +
  `
attribute vec3 arcCenter; attribute vec3 basisU; attribute vec3 basisV; attribute float sweep;
varying vec2 joinEnds;
void main() {
  float stepAngle=clamp(2.*acos(clamp(1.-max(1.e-12,pixel*.32)/length(basisU),-1.,1.)),.13089969,1.04719755);
  float n=clamp(ceil(abs(sweep)/stepAngle),2.,48.);
  if(position.z>=n) {gl_Position=vec4(2.,2.,2.,1.);return;}
  float t0=sweep*position.z/n, t1=sweep*(position.z+1.)/n;
  vec3 start=arcCenter+basisU*cos(t0)+basisV*sin(t0);
  vec3 end=arcCenter+basisU*cos(t1)+basisV*sin(t1);
  joinEnds=vec2(position.z>0. ? 1. : 0., position.z+1.<n ? 1. : 0.);
` +
  projectSegment;
const colorCode = `
uniform float selected; uniform float partner;
uniform bool groupedSelection; uniform highp sampler2D groupMembers;
uniform vec3 assetColor; uniform vec3 contextColor; uniform vec3 highlight;
uniform bool picking; varying float objectId;
vec3 surfaceColor() {
  if(objectId>0. && abs(objectId-selected)<.25) return highlight;
  if(objectId>0. && abs(objectId-partner)<.25) return vec3(.58,.38,.87);
  if(groupedSelection && objectId>0.) {
    int id=int(objectId+.5), width=textureSize(groupMembers,0).x;
    float role=texelFetch(groupMembers,ivec2(id%width,id/width),0).r*255.;
    if(abs(role-1.)<.25) return highlight;
    if(abs(role-2.)<.25) return vec3(.58,.38,.87);
  }
  return objectId>0. ? assetColor : contextColor;
}
vec4 pickColor() {return vec4(mod(objectId,256.),mod(floor(objectId/256.),256.),floor(objectId/65536.),255.)/255.;}
`;
const tubeFragment =
  colorCode +
  `
uniform vec2 clip;
varying vec4 shape; varying vec3 point; varying vec2 orientation;
#ifdef CURVE_JOIN
varying vec2 joinEnds;
#endif
void main() {
  float x=point.x, y=point.y;
  if(abs(y)>1.) discard;
  float root=sqrt(max(0.,1.-y*y)), a=shape.x, b=shape.y, l=shape.z;
  float z=-1.e30;
  vec2 side=vec2(-orientation.y,orientation.x);
  vec3 normal=vec3(0.,0.,1.);
  if(a>1.e-6) {
    float s=(x+b*root)/a;
    if(s>=0. && s<=l) {
      z=s*b+a*root;
      normal=vec3(-orientation*b*root+side*y,a*root);
    }
  }
  if(abs(b)>1.e-6) {
    float s=b>=0. ? l : 0.;
    float dx=x-s*a;
    if(abs(dx)<=abs(b)*root) {
      float cz=s*b-a*dx/b;
      if(cz>z) { z=cz; normal=vec3(orientation*a,b)*sign(b); }
    }
  }
  #ifdef CURVE_JOIN
  for(int i=0;i<2;i++) {
    if(joinEnds[i]<.5) continue;
    float dx=x-float(i)*l*a, disc=1.-dx*dx-y*y;
    if(disc>=0.) {
      float top=sqrt(disc), cz=float(i)*l*b+top;
      if(cz>z) {z=cz;normal=vec3(orientation*dx+side*y,top);}
    }
  }
  #endif
  if(z< -1.e29) discard;
  gl_FragDepth=clamp((-(point.z+z*shape.w)-clip.x)/(clip.y-clip.x),0.,1.);
  float light=.80+.20*dot(normal,vec3(-.35,.55,.75));
  gl_FragColor=picking ? pickColor() : vec4(surfaceColor()*light,1.);
}`;
const faceVertex = `
attribute float asset;
uniform bool hideContext;
varying float objectId; varying vec3 viewPoint;
void main() {
  objectId=asset;
  if(hideContext && asset==0.) {gl_Position=vec4(2.,2.,2.,1.);return;}
  vec4 p=modelViewMatrix*vec4(position,1.);
  viewPoint=p.xyz; gl_Position=projectionMatrix*p;
}`;
const outlineVertex = `
attribute float asset;
uniform bool hideContext;
uniform float pointSize;
varying float objectId;
void main() {
  objectId=asset; gl_PointSize=pointSize;
  gl_Position=hideContext && asset==0. ? vec4(2.,2.,2.,1.) : projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;
const outlineFragment =
  colorCode +
  `
void main() { gl_FragColor=vec4(surfaceColor()*.94,1.); }`;
const faceFragment =
  colorCode +
  `
varying vec3 viewPoint;
void main() {
  vec3 normal=normalize(cross(dFdx(viewPoint),dFdy(viewPoint)));
  float light=.70+.30*abs(dot(normal,vec3(-.35,.55,.75)));
  gl_FragColor=picking ? pickColor() : vec4(surfaceColor()*light,1.);
}`;

function toBox(bounds) {
  return new T.Box3(new T.Vector3(...bounds[0]), new T.Vector3(...bounds[1]));
}
function quads(count) {
  const vertices = [],
    indices = [];
  for (let i = 0; i < count; i++) {
    const a = 4 * i;
    vertices.push(0, -1, i, 1, -1, i, 0, 1, i, 1, 1, i);
    indices.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  return {
    position: new T.Float32BufferAttribute(vertices, 3),
    index: new T.Uint16BufferAttribute(indices, 1),
  };
}
export function createSceneView(mount, data, events) {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0, 0);
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  mount.appendChild(canvas);
  const camera = new T.OrthographicCamera(-1, 1, 1, -1);
  camera.up.set(0, 0, 1);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.zoomToCursor = true;
  controls.screenSpacePanning = true;
  controls.minZoom = 0.02;
  controls.maxZoom = 1e7;
  const box = toBox(data.bounds),
    center = box.getCenter(new T.Vector3()),
    span = box.getSize(new T.Vector3()).length() || 1;
  const worldUp = new T.Vector3(0, 0, 1);
  let mode = "plan",
    fitBounds = data.bounds,
    frame = 0,
    dead = false,
    readW = 0,
    readH = 0;
  const width = Math.min(1024, data.owners.length),
    height = Math.ceil(data.owners.length / width),
    memberships = new Uint8Array(width * height),
    membershipTexture = new T.DataTexture(
      memberships,
      width,
      height,
      T.RedFormat,
    );
  membershipTexture.needsUpdate = true;
  const uniforms = {
    pixel: { value: 1 },
    pointSize: { value: renderer.getPixelRatio() * 1.25 },
    picking: { value: false },
    hideContext: { value: false },
    clip: { value: new T.Vector2() },
    selected: { value: 0 },
    partner: { value: 0 },
    groupedSelection: { value: false },
    groupMembers: { value: membershipTexture },
    assetColor: { value: new T.Color() },
    contextColor: { value: new T.Color() },
    highlight: { value: new T.Color() },
  };
  const resources = [membershipTexture];
  function material(vertexShader, fragmentShader) {
    const mat = new T.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: T.DoubleSide,
    });
    resources.push(mat);
    return mat;
  }
  const tubeMaterial = material(tubeVertex, tubeFragment);
  const arcMaterial = material(
    arcVertex,
    "#define CURVE_JOIN\n" + tubeFragment,
  );
  const surfaceMaterial = material(faceVertex, faceFragment);
  const tubeBase = quads(1),
    arcBase = quads(maxCurveSteps);
  const detail = new T.Scene();
  const detailTiles = [],
    frustum = new T.Frustum(),
    viewProjection = new T.Matrix4(),
    marginBox = new T.Box3();
  const primitives =
    data.tubeOwners.length + data.arcOwners.length + data.faceOwners.length / 3;
  const spanAxis = Math.max(...box.getSize(new T.Vector3()).toArray());
  const levels =
    primitives >= 24000 && spanAxis > 0
      ? [1024, 4096].map((divisor) => ({
          step: spanAxis / divisor,
          scene: null,
        }))
      : [];
  const curvesByScene = new Map([[detail, []]]);
  let detailReady = false;
  function addMesh(scene, mesh, bounds) {
    if (scene === detail) {
      // A sphere around a long, narrow pipe covers much of the field. Test its
      // actual box, with enough screen-space margin for a one-pixel pick.
      mesh.frustumCulled = false;
      detailTiles.push([mesh, bounds]);
    }
    scene.add(mesh);
  }
  function addTubes(scene, curved, order) {
    const rows = curved ? data.arcCoords : data.tubeCoords;
    const owners = curved ? data.arcOwners : data.tubeOwners;
    const stride = curved ? 13 : 9,
      size = curved ? 256 : 1024;
    const base = curved ? arcBase : tubeBase;
    const fields = curved
      ? [
          ["arcCenter", 3, 2],
          ["basisU", 3, 5],
          ["basisV", 3, 8],
          ["sweep", 1, 11],
          ["radius", 1, 12],
        ]
      : [
          ["start", 3, 2],
          ["end", 3, 5],
          ["radius", 1, 8],
        ];
    for (let first = 0; first < order.length; first += size) {
      const end = Math.min(first + size, order.length),
        count = end - first;
      const packed = new Float32Array(count * stride),
        ids = new Float32Array(count);
      const low = [Infinity, Infinity, Infinity],
        high = [-Infinity, -Infinity, -Infinity];
      let major = 0,
        sweep = 0;
      for (let i = first; i < end; i++) {
        const n = order[i],
          offset = n * stride;
        ids[i - first] = owners[n];
        for (let k = 0; k < stride; k++)
          packed[(i - first) * stride + k] = rows[offset + k];
        if (curved) {
          major = Math.max(major, arcRadius(rows, offset));
          sweep = Math.max(sweep, Math.abs(rows[offset + 11]));
        }
        for (let k = 0; k < 3; k++) {
          const lo = curved
            ? data.arcExtents[n * 6 + k]
            : Math.min(rows[offset + 2 + k], rows[offset + 5 + k]) -
              rows[offset + 8];
          const hi = curved
            ? data.arcExtents[n * 6 + k + 3]
            : Math.max(rows[offset + 2 + k], rows[offset + 5 + k]) +
              rows[offset + 8];
          low[k] = Math.min(low[k], lo);
          high[k] = Math.max(high[k], hi);
        }
      }
      const geometry = new T.InstancedBufferGeometry(),
        source = new T.InstancedInterleavedBuffer(packed, stride);
      geometry.setAttribute("position", base.position);
      geometry.setIndex(base.index);
      for (const [name, components, offset] of fields)
        geometry.setAttribute(
          name,
          new T.InterleavedBufferAttribute(source, components, offset),
        );
      geometry.setAttribute("asset", new T.InstancedBufferAttribute(ids, 1));
      geometry.instanceCount = count;
      const bounds = toBox([low, high]);
      geometry.boundingSphere = bounds.getBoundingSphere(new T.Sphere());
      addMesh(
        scene,
        new T.Mesh(geometry, curved ? arcMaterial : tubeMaterial),
        bounds,
      );
      resources.push(geometry);
      if (curved) curvesByScene.get(scene).push({ geometry, major, sweep });
    }
  }
  function addVertices(scene, packed, primitive, mat) {
    if (!packed.length) return;
    const geometry = new T.BufferGeometry(),
      source = new T.InterleavedBuffer(packed, 4);
    geometry.setAttribute(
      "position",
      new T.InterleavedBufferAttribute(source, 3, 0),
    );
    geometry.setAttribute(
      "asset",
      new T.InterleavedBufferAttribute(source, 1, 3),
    );
    geometry.computeBoundingBox();
    addMesh(scene, new primitive(geometry, mat), geometry.boundingBox);
    resources.push(geometry);
  }
  function buildDetail() {
    for (const curved of [false, true]) {
      const rows = curved ? data.arcCoords : data.tubeCoords;
      addTubes(
        detail,
        curved,
        spatialOrder(
          rows,
          curved ? 13 : 9,
          curved ? "arc" : "tube",
          data.bounds,
        ),
      );
    }
    const order = spatialOrder(data.faceCoords, 9, "face", data.bounds),
      batchSize = 768;
    for (let first = 0; first < order.length; first += batchSize) {
      const end = Math.min(first + batchSize, order.length),
        packed = new Float32Array((end - first) * 12);
      for (let i = first; i < end; i++) {
        const n = order[i],
          id = data.faceOwners[n * 3];
        for (let j = 0; j < 3; j++) {
          const a = n * 9 + j * 3,
            b = (i - first) * 12 + j * 4;
          packed[b] = data.faceCoords[a];
          packed[b + 1] = data.faceCoords[a + 1];
          packed[b + 2] = data.faceCoords[a + 2];
          packed[b + 3] = id;
        }
      }
      addVertices(detail, packed, T.Mesh, surfaceMaterial);
    }
    detailReady = true;
  }
  function geometryFor(pixel, picking) {
    const level = !picking && levels.find((entry) => pixel >= entry.step);
    if (level) {
      if (!level.scene) {
        const overview = new T.Scene(),
          coarse = makeOverview(data, level.step),
          outlines = material(outlineVertex, outlineFragment);
        curvesByScene.set(overview, []);
        addVertices(overview, coarse.faces, T.Mesh, surfaceMaterial);
        addVertices(overview, coarse.lines, T.LineSegments, outlines);
        addVertices(overview, coarse.points, T.Points, outlines);
        addTubes(overview, false, coarse.thickTubes);
        addTubes(overview, true, coarse.thickArcs);
        level.scene = overview;
      }
      return level.scene;
    }
    if (!detailReady) buildDetail();
    return detail;
  }
  function renderGeometry(picking = false) {
    const pixel = uniforms.pixel.value,
      scene = geometryFor(pixel, picking);
    if (scene === detail) {
      camera.updateMatrixWorld();
      frustum.setFromProjectionMatrix(
        viewProjection.multiplyMatrices(
          camera.projectionMatrix,
          camera.matrixWorldInverse,
        ),
      );
      const margin = (picking ? 3 : 0.65) * pixel;
      for (const [mesh, bounds] of detailTiles)
        mesh.visible = frustum.intersectsBox(
          marginBox.copy(bounds).expandByScalar(margin),
        );
    }
    for (const { geometry, major, sweep } of curvesByScene.get(scene)) {
      geometry.setDrawRange(
        0,
        6 * Math.min(maxCurveSteps, curveSteps(major, sweep, pixel) + 1),
      );
    }
    renderer.render(scene, camera);
  }
  function updateTheme() {
    const dark = document.documentElement.classList.contains("dark-mode");
    // The custom shader writes sRGB values directly to the display surface.
    uniforms.assetColor.value.setRGB(
      ...(dark ? [0.53, 0.76, 0.81] : [0.18, 0.41, 0.47]),
    );
    uniforms.contextColor.value.setRGB(
      ...(dark ? [0.47, 0.52, 0.56] : [0.59, 0.65, 0.68]),
    );
    uniforms.highlight.value.setRGB(
      ...(dark ? [1, 0.72, 0.24] : [0.93, 0.41, 0.09]),
    );
    invalidate();
  }
  function project(p) {
    const out = new T.Vector3(...p).project(camera);
    return [((out.x + 1) * readW) / 2, ((1 - out.y) * readH) / 2, out.z];
  }
  function draw() {
    if (dead || !readW || !readH || !mount.clientWidth) return;
    uniforms.pixel.value = (camera.top - camera.bottom) / camera.zoom / readH;
    uniforms.clip.value.set(camera.near, camera.far);
    renderGeometry();
    events.onDraw(uniforms.pixel.value, project, readW, readH);
  }
  function invalidate() {
    if (dead || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      draw();
    });
  }
  function resizeFrustum() {
    if (!readW || !readH) return;
    const b = toBox(fitBounds),
      d = b.getSize(new T.Vector3());
    camera.updateMatrixWorld(true);
    const right = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 0),
      up = new T.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const projected = (v) =>
      Math.abs(v.x * d.x) + Math.abs(v.y * d.y) + Math.abs(v.z * d.z);
    const height =
      Math.max(projected(up), (projected(right) * readH) / readW, span * 1e-8) *
      1.12;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.right = (camera.top * readW) / readH;
    camera.left = -camera.right;
    camera.updateProjectionMatrix();
  }
  function fit(bounds) {
    fitBounds = bounds;
    const target = toBox(bounds).getCenter(new T.Vector3());
    const dir =
      mode === "plan"
        ? new T.Vector3(0, 0, 1)
        : camera.position.clone().sub(controls.target).normalize();
    if (mode !== "plan" && (!dir.lengthSq() || Math.abs(dir.z) > 0.999))
      dir.set(0.82, -1.38, 0.92).normalize();
    controls.target.copy(target);
    camera.near = Math.max(span * 1e-6, 1e-6);
    camera.far = span * 5 + 1;
    camera.position.copy(target).addScaledVector(dir, span * 2 + 0.1);
    camera.up.copy(mode === "plan" ? new T.Vector3(0, 1, 0) : worldUp);
    camera.lookAt(target);
    camera.zoom = 1;
    resizeFrustum();
    controls.update();
    invalidate();
  }
  function setMode(next) {
    mode = next;
    controls.enableRotate = next === "spatial";
    controls.mouseButtons.LEFT =
      next === "spatial" ? T.MOUSE.ROTATE : T.MOUSE.PAN;
    controls.touches.ONE = next === "spatial" ? T.TOUCH.ROTATE : T.TOUCH.PAN;
    canvas.setAttribute(
      "aria-label",
      next === "spatial" ? "工区三维装配图" : "工区二维总平面图",
    );
    // OrbitControls orbits around the same plant Z axis in each spatial view.
    if (next === "spatial") {
      camera.up.copy(worldUp);
      camera.position
        .copy(controls.target)
        .add(
          new T.Vector3(0.82, -1.38, 0.92).normalize().multiplyScalar(span * 2),
        );
    }
    fit(fitBounds);
  }
  function resize() {
    const w = mount.clientWidth,
      h = mount.clientHeight;
    if (w <= 0 || h <= 0) return;
    if (w === readW && h === readH) {
      invalidate();
      return;
    }
    readW = w;
    readH = h;
    renderer.setSize(w, h, false);
    resizeFrustum();
    invalidate();
  }
  function zoom(factor) {
    camera.zoom = T.MathUtils.clamp(
      camera.zoom * factor,
      controls.minZoom,
      controls.maxZoom,
    );
    camera.updateProjectionMatrix();
    controls.update();
    invalidate();
  }
  const pickTarget = new T.WebGLRenderTarget(1, 1, {
      colorSpace: T.NoColorSpace,
    }),
    sample = new Uint8Array(4);
  let down = null;
  function pointerDown(e) {
    if (e.isPrimary && e.button === 0) down = [e.clientX, e.clientY];
  }
  function pointerUp(e) {
    if (
      !down ||
      !e.isPrimary ||
      e.button !== 0 ||
      Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4
    ) {
      down = null;
      return;
    }
    down = null;
    const b = canvas.getBoundingClientRect(),
      x = Math.floor(e.clientX - b.left),
      y = Math.floor(e.clientY - b.top);
    if (x < 0 || x >= readW || y < 0 || y >= readH) return;
    uniforms.picking.value = true;
    try {
      camera.setViewOffset(readW, readH, x, y, 1, 1);
      renderer.setRenderTarget(pickTarget);
      renderGeometry(true);
      renderer.readRenderTargetPixels(pickTarget, 0, 0, 1, 1, sample);
    } finally {
      uniforms.picking.value = false;
      camera.clearViewOffset();
      renderer.setRenderTarget(null);
      invalidate();
    }
    const id = sample[0] + sample[1] * 256 + sample[2] * 65536;
    if (data.owners[id]) events.onPick(data.owners[id].key);
  }
  function keydown(e) {
    if (e.key === "Home") events.onFit();
    else if (e.key === "+" || e.key === "=") zoom(1.6);
    else if (e.key === "-") zoom(1 / 1.6);
    else return;
    e.preventDefault();
  }
  function lost(e) {
    e.preventDefault();
    events.onLost();
  }
  controls.addEventListener("change", invalidate);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", () => {
    down = null;
  });
  canvas.addEventListener("keydown", keydown);
  canvas.addEventListener("webglcontextlost", lost);
  const theme = new MutationObserver(updateTheme),
    observer = new ResizeObserver(resize);
  theme.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-page-style", "data-interface-style"],
  });
  observer.observe(mount);
  controls.target.copy(center);
  updateTheme();
  resize();
  setMode("plan");
  return {
    fit,
    zoom,
    setMode,
    refresh: invalidate,
    select(ids, others = []) {
      uniforms.selected.value = ids.length === 1 ? ids[0] : 0;
      uniforms.partner.value = others.length === 1 ? others[0] : 0;
      uniforms.groupedSelection.value = ids.length > 1 || others.length > 1;
      if (uniforms.groupedSelection.value) {
        memberships.fill(0);
        for (const id of others) memberships[id] = 2;
        for (const id of ids) memberships[id] = 1;
        membershipTexture.needsUpdate = true;
      }
      invalidate();
    },
    hideContext(v) {
      uniforms.hideContext.value = v;
      invalidate();
    },
    dispose() {
      dead = true;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      theme.disconnect();
      controls.dispose();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("keydown", keydown);
      canvas.removeEventListener("webglcontextlost", lost);
      for (const r of resources) r.dispose();
      pickTarget.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
