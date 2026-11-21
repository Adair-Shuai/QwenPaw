import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
const React = window.QwenPaw.host.React;
export function EzGeometry({ encoded }) {
  const mount = React.useRef(null),
    [flat, setFlat] = React.useState(false),
    [error, setError] = React.useState("");
  React.useEffect(() => {
    if (!encoded) return;
    const div = mount.current,
      bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const data = new Float32Array(bytes.buffer),
      count = data.length / 7;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError("三维显示需要 WebGL 2");
      return;
    }
    setError("");
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.setClearColor(0x000000, 0);
    div.appendChild(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.001, 1000),
      controls = new OrbitControls(camera, renderer.domElement);
    const material = new T.MeshStandardMaterial({
        color: 0x547584,
        roughness: 0.6,
      }),
      geo = new T.CylinderGeometry(1, 1, 1, 16);
    const bodies = new T.InstancedMesh(geo, material, count),
      bb = new T.Box3(),
      a = new T.Vector3(),
      b = new T.Vector3(),
      axis = new T.Vector3(),
      up = new T.Vector3(0, 1, 0),
      pose = new T.Object3D();
    for (let i = 0; i < count; i++) {
      const j = i * 7,
        r = data[j + 6];
      a.fromArray(data, j);
      b.fromArray(data, j + 3);
      bb.union(new T.Box3().setFromPoints([a, b]).expandByScalar(r));
      axis.subVectors(b, a);
      pose.position.copy(a).lerp(b, 0.5);
      pose.scale.set(r, axis.length(), r);
      pose.quaternion.setFromUnitVectors(up, axis.normalize());
      pose.updateMatrix();
      bodies.setMatrixAt(i, pose.matrix);
    }
    const center = bb.getCenter(new T.Vector3()),
      span = Math.max(bb.getSize(new T.Vector3()).length(), 0.001);
    bodies.position.copy(center).negate();
    scene.add(bodies, new T.HemisphereLight(0xffffff, 0x8d99a3, 2));
    const light = new T.DirectionalLight(0xffffff, 2);
    light.position.set(2, 4, 3);
    scene.add(light);
    camera.near = span * 0.001;
    camera.far = span * 20;
    camera.up.set(0, flat ? 0 : 1, flat ? -1 : 0);
    camera.position
      .copy(flat ? new T.Vector3(0, 1, 0) : new T.Vector3(1, 0.85, 1))
      .normalize()
      .multiplyScalar(span * 2);
    controls.enableRotate = !flat;
    controls.update();
    function draw() {
      renderer.render(scene, camera);
    }
    function resize() {
      const { clientWidth: w, clientHeight: h } = div;
      if (!w || !h) return;
      const ratio = w / h,
        half = span * 0.55;
      camera.left = -half * Math.max(1, ratio);
      camera.right = -camera.left;
      camera.top = half * Math.max(1, 1 / ratio);
      camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      draw();
    }
    controls.addEventListener("change", draw);
    const ob = new ResizeObserver(resize);
    ob.observe(div);
    resize();
    return () => {
      ob.disconnect();
      controls.dispose();
      geo.dispose();
      material.dispose();
      bodies.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      div.replaceChildren();
    };
  }, [encoded, flat]);
  if (!encoded)
    return <p className="sn-empty">此对象没有可预览的同坐标系圆柱构件。</p>;
  return (
    <>
      <div className="sn-ez-controls">
        <strong>原模型构件</strong>
        <select
          aria-label="构件视图"
          value={flat ? "plan" : "3d"}
          onChange={(e) => setFlat(e.target.value === "plan")}
        >
          <option value="3d">三维轴测</option>
          <option value="plan">俯视投影</option>
        </select>
      </div>
      <div className="sn-ez-scene" ref={mount} />
      {error && <p role="alert">{error}</p>}
    </>
  );
}
