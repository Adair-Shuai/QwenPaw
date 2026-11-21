import { Icon } from "./Icon.jsx";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { equipment, groups } from "./equipment.js";
import { equipmentMesh } from "./equipmentMesh.js";
import { SymbolMark } from "./Diagram.jsx";
const React = window.QwenPaw.host.React;
function EquipmentView({ type }) {
  const ref = React.useRef(null),
    [error, setError] = React.useState("");
  React.useEffect(() => {
    const mount = ref.current;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError("三维视图需要 WebGL 2");
      return;
    }
    setError("");
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(32, 1, 0.05, 100);
    const model = equipmentMesh(type);
    scene.add(model);
    const box = new T.Box3().setFromObject(model),
      center = box.getCenter(new T.Vector3()),
      size = box.getSize(new T.Vector3()).length();
    const grid = new T.GridHelper(12, 24, 0x728392, 0x8d98a1);
    grid.material.transparent = true;
    grid.material.opacity = 0.33;
    grid.position.y = box.min.y - 0.04;
    scene.add(grid);
    scene.add(new T.HemisphereLight(0xffffff, 0x99a3a9, 2.15));
    const sun = new T.DirectionalLight(0xffffff, 2.6);
    sun.position.set(-4, 7, 5);
    scene.add(sun);
    const ctl = new OrbitControls(camera, renderer.domElement);
    ctl.target.copy(center);
    ctl.maxPolarAngle = Math.PI * 0.85;
    ctl.minDistance = size * 0.54;
    ctl.maxDistance = size * 4.8;
    function resize() {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      draw();
    }
    function draw() {
      renderer.render(scene, camera);
    }
    camera.position
      .copy(center)
      .addScaledVector(new T.Vector3(1.2, 0.83, 1.75).normalize(), size * 1.85);
    ctl.update();
    ctl.addEventListener("change", draw);
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();
    const lost = (e) => {
      e.preventDefault();
      setError("三维上下文中断，请重新选择设备");
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      observer.disconnect();
      ctl.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      renderer.dispose();
      renderer.forceContextLoss();
      mount.replaceChildren();
    };
  }, [type]);
  return (
    <div
      className="sn-part-webgl"
      aria-label={equipment[type].name + "三维模型"}
      ref={ref}
    >
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
export function Register({ initial = "well" }) {
  const [type, choose] = React.useState(initial),
    [query, search] = React.useState("");
  const indexList = React.useRef(null);
  React.useLayoutEffect(() => {
    const list = indexList.current,
      active = list.querySelector('[aria-pressed="true"]');
    if (!active) return;
    const row = active.getBoundingClientRect(),
      pane = list.getBoundingClientRect();
    if (row.top < pane.top || row.bottom > pane.bottom)
      list.scrollTop += row.top - pane.top - list.clientHeight * 0.35;
  }, [type, query]);
  const item = equipment[type],
    matches = Object.values(equipment).filter((e) =>
      (e.name + e.tag + e.group)
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  return (
    <section className="sn-library" aria-label="设备图册">
      <header className="sn-page-head">
        <div>
          <div className="sn-context">
            <Icon name="register" />
            工程资料
          </div>
          <h2>设备图册</h2>
        </div>
        <span className="sn-library-count">
          {groups.length} 个分类 · {Object.keys(equipment).length} 类设备
        </span>
      </header>
      <div className="sn-register">
        <nav aria-label="设备分类">
          <div className="sn-index-head">
            <h3>设备索引</h3>
            <label className="sn-search">
              <Icon name="search" />
              <input
                type="search"
                aria-label="查找设备"
                placeholder="名称或代号"
                value={query}
                onChange={(e) => search(e.target.value)}
              />
            </label>
          </div>
          <div className="sn-index-scroll" ref={indexList}>
            {groups.map((group) => {
              const rows = matches.filter((e) => e.group === group);
              return (
                rows.length > 0 && (
                  <div key={group}>
                    <h3>{group}</h3>
                    {rows.map((e) => (
                      <button
                        key={e.type}
                        aria-pressed={type === e.type}
                        onClick={() => choose(e.type)}
                      >
                        <svg viewBox="-18 -16 36 32" aria-hidden="true">
                          <SymbolMark type={e.type} />
                        </svg>
                        {e.name}
                        <code>{e.tag}</code>
                      </button>
                    ))}
                  </div>
                )
              );
            })}
            {!matches.length && <p className="sn-empty">无匹配设备</p>}
          </div>
        </nav>
        <article>
          <header>
            <div>
              <small>{item.group}</small>
              <h3>{item.name}</h3>
            </div>
            <code>{item.tag}</code>
          </header>
          <div className="sn-plates">
            <figure>
              <figcaption>
                <Icon name="diagram" />
                二维图例
              </figcaption>
              <svg
                className="sn-drawing"
                viewBox="-38 -32 76 64"
                aria-label={item.name + "二维符号"}
              >
                <path
                  d="M-35 0H35M0 -29V29"
                  fill="none"
                  stroke="#b6bdbf"
                  strokeDasharray="3 1 .5 1"
                  strokeWidth=".28"
                />
                <SymbolMark type={type} />
              </svg>
            </figure>
            <figure>
              <figcaption>
                <Icon name="cube" />
                三维外形
              </figcaption>
              <EquipmentView type={type} />
            </figure>
          </div>
          <dl className="sn-spec">
            <dt>结构特征</dt>
            <dd>{item.detail}</dd>
            <dt>尺寸说明</dt>
            <dd>示意外形，非比例绘制</dd>
          </dl>
        </article>
      </div>
    </section>
  );
}
