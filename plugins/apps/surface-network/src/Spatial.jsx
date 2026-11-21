import { equipmentMesh } from "./equipmentMesh.js";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { bounds } from "./model.js";
const React = window.QwenPaw.host.React;
const up = new T.Vector3(0, 1, 0);
function cylinder(scene, start, end, r, material) {
  const axis = end.clone().sub(start);
  const mesh = new T.Mesh(
    new T.CylinderGeometry(r, r, Math.max(axis.length(), 0.001), 14),
    material,
  );
  mesh.position.copy(start).lerp(end, 0.5);
  mesh.quaternion.setFromUnitVectors(up, axis.normalize());
  scene.add(mesh);
  return mesh;
}
function buildScene(mount, model, onPick, onSensor, onFail) {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(37, 1, 0.1, 2000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.minDistance = 3;
  controls.maxDistance = 330;
  const [[x0, x1], [y0, y1], [z0, z1]] = bounds([
    ...model.nodes.map((n) => n.enuM),
    ...(model.sensors ?? []).map((s) => s.enuM).filter(Boolean),
    ...model.pipes.flatMap((p) => p.viaM ?? []),
  ]);
  const unit = 80 / Math.max(x1 - x0, y1 - y0, z1 - z0, 1),
    floor = -1;
  const position = ([east, north, z]) =>
    new T.Vector3(
      (east - (x0 + x1) / 2) * unit,
      (z - z0) * unit + 1.3,
      ((y0 + y1) / 2 - north) * unit,
    );
  const coords = new Map(model.nodes.map((n) => [n.id, position(n.enuM)]));
  const mat = (color) => new T.MeshStandardMaterial({ color, roughness: 0.55 });
  const grid = new T.GridHelper(120, 30, 0x728392, 0x8d98a1);
  grid.material.transparent = true;
  grid.material.opacity = 0.33;
  grid.position.y = floor;
  scene.add(grid);
  scene.add(new T.HemisphereLight(0xffffff, 0xabc7b7, 2.0));
  const sun = new T.DirectionalLight(0xfff8eb, 2.2);
  sun.position.set(-30, 80, 30);
  scene.add(sun);
  const objects = [],
    tags = [],
    pipes = [],
    nodes = [];
  const attach = (mesh, id) => {
    mesh.userData.id = id;
    objects.push(mesh);
    return mesh;
  };
  function box(id, base, dx, dy, dz, lift, color, offset = 0) {
    const mesh = new T.Mesh(new T.BoxGeometry(dx, dy, dz), mat(color));
    mesh.position.copy(base);
    mesh.position.x += offset;
    mesh.position.y += lift;
    scene.add(mesh);
    return attach(mesh, id);
  }
  const anchors = new Map(coords),
    sensors = [];
  const fittings = new Map();
  for (const n of model.nodes) {
    const v = coords.get(n.id);
    const part = equipmentMesh(n.type);
    part.scale.setScalar(1.28);
    part.position.copy(v);
    const connected = model.pipes.find((p) => p.from === n.id || p.to === n.id);
    if (connected) {
      const forward = connected.from === n.id;
      const next = forward ? connected.viaM?.[0] : connected.viaM?.at(-1);
      const neighbor = next
        ? position(next)
        : coords.get(forward ? connected.to : connected.from);
      const dir = neighbor
        .clone()
        .sub(v)
        .multiplyScalar(forward ? 1 : -1);
      part.rotation.y = Math.atan2(-dir.z, dir.x);
    }
    part.traverse((o) => {
      if (o.isMesh) attach(o, n.id);
    });
    scene.add(part);
    const baseHeight = new T.Box3().setFromObject(part).min.y;
    const pad = box(n.id, v, 4.8, 0.18, 2.9, baseHeight - v.y - 0.09, 0xb8bfc0);
    nodes.push([n.id, pad]);
    fittings.set(n.id, { part, type: n.type });
    const label = document.createElement("span");
    label.textContent = n.id;
    label.className = "sn-tag";
    mount.appendChild(label);
    tags.push([label, v.clone().addScaledVector(up, 4.4)]);
  }
  function nozzle(id, towards) {
    const { part, type } = fittings.get(id);
    const connections = {
      separator: [
        [-1.45, -0.05, 0],
        [1.45, 1.585, 0],
      ],
      dehydrator: [
        [-1.45, -0.05, 0],
        [1.45, 2.555, 0],
      ],
      filter: [
        [-1.45, -0.05, 0],
        [1.45, 1.203, 0],
      ],
      well: [
        [-1.1, 0.18, 0],
        [1.18, 0.18, 0],
      ],
      manifold: [
        [-1.65, 0, 0],
        [1.65, 0, 0],
        [-1, 0, 0.99],
        [0, 0, 0.99],
        [1, 0, 0.99],
      ],
      compressor: [
        [1.65, 0.06, 0],
        [1.38, 1.14, 0],
      ],
      blind: [[-1.45, 0, 0]],
      flange: [
        [-1.65, 0, 0],
        [1.65, 0, 0],
      ],
    };
    const through = [
      "pipe",
      "tee",
      "cross",
      "gate",
      "ball",
      "globe",
      "check",
      "regulator",
      "esd",
      "choke",
      "meter",
      "orifice",
      "support",
      "blowdown",
      "arrestor",
    ];
    const ends =
      connections[type] ??
      (through.includes(type)
        ? [
            [-1.45, 0, 0],
            [1.45, 0, 0],
          ]
        : [[0, 0, 0]]);
    return ends
      .map((point) => part.localToWorld(new T.Vector3(...point)))
      .reduce((a, b) =>
        a.distanceToSquared(towards) <= b.distanceToSquared(towards) ? a : b,
      );
  }
  for (const p of model.pipes) {
    const points = [
      coords.get(p.from),
      ...(p.viaM ?? []).map(position),
      coords.get(p.to),
    ];
    const next = points[1],
      prev = points.at(-2);
    points[0] = nozzle(p.from, next);
    points[points.length - 1] = nozzle(p.to, prev);
    const bodyMaterial = mat(0xffffff);
    const r = Math.min(0.39, Math.max(0.14, p.dn / 950));
    let longest = 0,
      a = points[0],
      b = points.at(-1);
    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1],
        end = points[i],
        len = start.distanceTo(end);
      if (len > longest) {
        longest = len;
        a = start;
        b = end;
      }
      if (len > 0) attach(cylinder(scene, start, end, r, bodyMaterial), p.id);
    }
    const direction = b.clone().sub(a).normalize();
    const arrow = new T.Mesh(
      new T.ConeGeometry(r * 2.35, r * 5.8, 12),
      mat(0xffffff),
    );
    arrow.position.copy(a).lerp(b, 0.52);
    scene.add(arrow);
    attach(arrow, p.id);
    pipes.push([p, bodyMaterial, arrow, direction]);
    anchors.set(p.id, arrow.position);
  }
  const offsets = new Map();
  for (const s of model.sensors ?? []) {
    const anchor = s.enuM ? position(s.enuM) : anchors.get(s.target),
      button = document.createElement("button");
    button.className = "sn-tag sn-sensor3d";
    button.textContent = s.tag;
    button.setAttribute("aria-label", "测点 " + s.tag);
    button.onclick = () => onSensor(s);
    mount.appendChild(button);
    const shift = offsets.get(s.target) ?? 0;
    offsets.set(s.target, shift + 1);
    button.style.marginTop = -15 - 17 * shift + "px";
    tags.push([button, anchor.clone().addScaledVector(up, 2.2)]);
    sensors.push([button, s.tag]);
  }
  const ring = new T.Mesh(
    new T.TorusGeometry(2.7, 0.13, 8, 48),
    new T.MeshBasicMaterial({ color: 0x145c52 }),
  );
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
  function draw() {
    renderer.render(scene, camera);
    for (const [tag, v] of tags) {
      const q = v.clone().project(camera);
      tag.style.left = 50 + 50 * q.x + "%";
      tag.style.top = 50 - 50 * q.y + "%";
      tag.hidden = Math.abs(q.x) > 1 || Math.abs(q.y) > 1 || Math.abs(q.z) > 1;
    }
  }
  function resize() {
    const w = mount.clientWidth,
      h = mount.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    draw();
  }
  function reset() {
    controls.target.set(0, (z1 - z0) * unit * 0.45, 0);
    camera.position
      .copy(controls.target)
      .add(
        new T.Vector3(24, 42, 58).multiplyScalar(
          Math.max(1, 1.75 / camera.aspect),
        ),
      );
    controls.update();
  }
  controls.addEventListener("change", draw);
  const observer = new ResizeObserver(resize);
  observer.observe(mount);
  resize();
  reset();
  let down = null;
  const canvas = renderer.domElement;
  function start(e) {
    down = [e.clientX, e.clientY];
  }
  function pick(e) {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5)
      return;
    const b = canvas.getBoundingClientRect(),
      ray = new T.Raycaster();
    ray.setFromCamera(
      new T.Vector2(
        (2 * (e.clientX - b.left)) / b.width - 1,
        1 - (2 * (e.clientY - b.top)) / b.height,
      ),
      camera,
    );
    const hit = ray.intersectObjects(objects, false)[0];
    if (hit) onPick(hit.object.userData.id);
  }
  const lost = (e) => {
    e.preventDefault();
    onFail("三维图形上下文中断，可切回二维后重试。");
  };
  canvas.addEventListener("pointerdown", start);
  canvas.addEventListener("pointerup", pick);
  canvas.addEventListener("webglcontextlost", lost);
  return {
    reset,
    update(c, colors, selected, showSensors, sensorTag) {
      for (const [button, tag] of sensors) {
        button.style.display = showSensors ? "" : "none";
        button.setAttribute("aria-pressed", String(sensorTag === tag));
      }
      for (const [p, body, arrow, d] of pipes) {
        body.color.set(colors.color(p));
        body.emissive.set(p.id === selected ? 0x15443d : 0);
        arrow.material.color.copy(body.color);
        arrow.visible = c.flow10kSm3d[p.id] !== 0;
        arrow.quaternion.setFromUnitVectors(
          up,
          d.clone().multiplyScalar(c.flow10kSm3d[p.id] < 0 ? -1 : 1),
        );
        if (p.id === selected) ring.position.copy(arrow.position);
      }
      for (const [id, pad] of nodes) {
        pad.material.color.set(id === selected ? 0x54b99c : 0xc6d5cc);
        if (id === selected) ring.position.copy(coords.get(id));
      }
      draw();
    },
    dispose() {
      observer.disconnect();
      controls.dispose();
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointerup", pick);
      scene.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      mount.replaceChildren();
    },
  };
}
export function Spatial({
  model,
  c,
  colors,
  selected,
  onPick,
  onSensor,
  showSensors,
  sensorTag,
}) {
  const mount = React.useRef(null),
    view = React.useRef(null),
    [error, setError] = React.useState("");
  React.useEffect(() => {
    setError("");
    try {
      view.current = buildScene(
        mount.current,
        model,
        onPick,
        onSensor,
        setError,
      );
    } catch {
      setError("当前环境无法启用 WebGL 2，可使用二维工艺图查看同一组数据。");
    }
    return () => {
      view.current?.dispose();
      view.current = null;
    };
  }, [model, onPick, onSensor]);
  React.useEffect(() => {
    view.current?.update(c, colors, selected, showSensors, sensorTag);
  }, [c, colors, selected, model, showSensors, sensorTag]);
  return (
    <div className="sn-space">
      <div className="sn-webgl" ref={mount} />
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <button className="sn-reset" onClick={() => view.current?.reset()}>
          复位视角
        </button>
      )}
    </div>
  );
}
