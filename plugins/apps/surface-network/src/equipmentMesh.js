import * as T from "three";
// Model-space X is the main pipe direction, Y is up. Nominal geometry is for identification.
export function equipmentMesh(type) {
  const g = new T.Group(),
    steel = 0x87969a,
    iron = 0x415d67,
    dark = 0x37464c,
    enamel = 0x546e74,
    drive = 0x937346,
    safety = 0xa4523a;
  const metals = new Map();
  function mesh(geometry, color, x, y, z) {
    if (!metals.has(color))
      metals.set(
        color,
        new T.MeshStandardMaterial({ color, metalness: 0.25, roughness: 0.49 }),
      );
    const m = new T.Mesh(geometry, metals.get(color));
    m.position.set(x, y, z);
    g.add(m);
    return m;
  }
  function box(x, y, z, w, h, d, col = iron) {
    return mesh(new T.BoxGeometry(w, h, d), col, x, y, z);
  }
  function tube(a, b, r, col = steel, r2 = r) {
    const start = new T.Vector3(...a),
      axis = new T.Vector3(...b).sub(start);
    const m = mesh(
      new T.CylinderGeometry(r2, r, axis.length(), 24),
      col,
      0,
      0,
      0,
    );
    m.position.copy(start).addScaledVector(axis, 0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), axis.normalize());
    return m;
  }
  function run(x1, x2, r = 0.26, y = 0, z = 0, col = steel) {
    return tube([x1, y, z], [x2, y, z], r, col);
  }
  function riser(x, z, y1, y2, r, col = steel) {
    return tube([x, y1, z], [x, y2, z], r, col);
  }
  function sphere(x, y, z, r, col = iron, scale = [1, 1, 1]) {
    const m = mesh(new T.SphereGeometry(r, 24, 16), col, x, y, z);
    m.scale.set(...scale);
    return m;
  }
  function flange(x, r = 0.48, y = 0, z = 0) {
    run(x - 0.065, x + 0.065, r, y, z, iron);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      run(
        x - 0.09,
        x + 0.09,
        0.043,
        y + Math.sin(a) * r * 0.78,
        z + Math.cos(a) * r * 0.78,
        dark,
      );
    }
  }
  function spool() {
    run(-1.65, 1.65);
    flange(-1.48);
    flange(1.48);
  }
  function wheel(x, y, z, r = 0.48) {
    const m = mesh(new T.TorusGeometry(r, 0.06, 8, 32), safety, x, y, z);
    m.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      let a = (i * 2 * Math.PI) / 3;
      tube(
        [x, y, z],
        [x + r * Math.cos(a), y, z + r * Math.sin(a)],
        0.035,
        safety,
      );
    }
  }
  function feet() {
    for (const x of [-0.85, 0.85]) box(x, -0.73, 0, 0.26, 0.55, 0.88, dark);
  }
  function vessel(h, r, col = steel) {
    riser(0, 0, -0.48, h, r, col);
    sphere(0, h, 0, r, col, [1, 0.45, 1]);
    sphere(0, -0.48, 0, r, col, [1, 0.45, 1]);
    for (const x of [-1, 1])
      for (const z of [-1, 1])
        box(x * r * 0.56, -0.88, z * r * 0.56, 0.12, 0.7, 0.12, dark);
    run(-1.45, -r * 0.85, 0.18, -0.05);
    flange(-1.36, 0.31, -0.05);
    riser(0, 0, h + 0.15 * r, h + 0.65 * r, 0.17);
    run(0, 1.45, 0.16, h + 0.65 * r);
  }
  function motor(x, y, z) {
    run(x - 0.65, x + 0.65, 0.44, y, z, iron);
    for (let i = 0; i < 8; i++)
      run(x - 0.56 + i * 0.15, x - 0.51 + i * 0.15, 0.48, y, z, dark);
    box(x, y + 0.48, z, 0.43, 0.2, 0.36, iron);
  }
  function gauge(x, y, z, col = steel) {
    const m = tube([x, y, z - 0.12], [x, y, z + 0.12], 0.38, dark);
    tube([x, y, z + 0.12], [x, y, z + 0.14], 0.315, col);
    tube([x, y, z + 0.16], [x + 0.19, y + 0.14, z + 0.16], 0.023, dark);
    return m;
  }
  switch (type) {
    case "pipe":
      run(-1.65, 1.65, 0.31);
      break;
    case "elbow": {
      const curve = new T.CubicBezierCurve3(
        new T.Vector3(-1.55, 0, 0),
        new T.Vector3(0.25, 0, 0),
        new T.Vector3(0.45, 0, 0.15),
        new T.Vector3(0.45, 0, 1.65),
      );
      mesh(new T.TubeGeometry(curve, 28, 0.29, 20, false), steel, 0, 0, 0);
      break;
    }
    case "tee":
    case "cross":
      run(-1.65, 1.65, 0.32);
      tube([0, 0, type === "cross" ? -1.25 : 0], [0, 0, 1.25], 0.3);
      break;
    case "reducer":
      run(-1.5, -0.65, 0.49);
      tube([-0.65, 0, 0], [0.65, 0, 0], 0.49, steel, 0.24);
      run(0.65, 1.5, 0.24);
      break;
    case "flange":
      spool();
      flange(-0.09, 0.59);
      flange(0.09, 0.59);
      break;
    case "blind":
      run(-1.45, 0, 0.36);
      flange(-0.08, 0.68);
      flange(0.08, 0.68);
      break;
    case "well":
      riser(0, 0, -1, 1.32, 0.34, iron);
      for (const h of [-0.65, -0.22, 0.46, 1.0])
        riser(0, 0, h, h + 0.13, 0.54, steel);
      for (const h of [0.18, 0.8]) {
        run(-1.1, 1.18, 0.24, h, 0, iron);
        flange(-0.8, 0.37, h);
        flange(0.8, 0.37, h);
      }
      riser(0, 0, 1.32, 1.59, 0.12);
      wheel(0, 1.62, 0);
      break;
    case "manifold":
      run(-1.65, 1.65, 0.41);
      feet();
      for (const x of [-1, 0, 1]) {
        tube([x, 0, 0], [x, 0, 0.99], 0.21);
        riser(x, 0.61, 0, 0.64, 0.13);
        wheel(x, 0.66, 0.61, 0.25);
      }
      flange(-1.54, 0.58);
      flange(1.54, 0.58);
      break;
    case "station":
    case "terminal":
      box(0, -0.57, 0, 3.35, 0.19, 1.99, dark);
      for (const z of [-0.52, 0.52]) {
        run(-1.6, 1.6, 0.18, 0, z);
        flange(-1.28, 0.31, 0, z);
        flange(1.28, 0.31, 0, z);
        if (type === "terminal") {
          riser(0.2, z, 0, 0.62, 0.08);
          gauge(0.2, 0.84, z);
        } else {
          sphere(-0.4, 0.01, z, 0.37);
          riser(-0.4, z, 0.17, 0.55, 0.1);
          wheel(-0.4, 0.56, z, 0.29);
        }
      }
      tube([-1.5, 0, -0.52], [-1.5, 0, 0.52], 0.2);
      tube([1.5, 0, -0.52], [1.5, 0, 0.52], 0.2);
      break;
    case "gate":
    case "globe":
    case "ball":
    case "choke":
    case "regulator":
    case "check":
    case "esd":
    case "relief":
      if (type === "relief") {
        run(-1.6, 0, 0.29);
        riser(0, 0, 0, 0.85, 0.3);
        run(0, 1.3, 0.26, 0.67);
        riser(0, 0, 0.64, 1.37, 0.29, safety);
        flange(1.2, 0.4, 0.67);
        break;
      }
      spool();
      if (type === "gate") box(0, 0.13, 0, 0.78, 0.83, 0.69, iron);
      else
        sphere(
          0,
          0.02,
          0,
          type === "ball" ? 0.62 : 0.5,
          iron,
          type === "globe" ? [1.35, 0.9, 1] : [1, 1, 1],
        );
      if (type === "check") {
        riser(0, 0, 0.24, 0.59, 0.43);
        break;
      }
      riser(0, 0, 0.28, 0.66, 0.28, iron);
      riser(0, 0, 0.66, 1, 0.085);
      if (type === "ball") box(0.38, 1, 0, 1.05, 0.11, 0.19, drive);
      else if (type === "esd") {
        box(0, 1.03, 0, 1.25, 0.54, 0.61, drive);
        box(0.57, 1.34, 0, 0.44, 0.32, 0.42, dark);
      } else if (type === "regulator") {
        sphere(0, 1.02, 0, 0.62, drive, [1, 0.43, 1]);
        tube([1.08, 0, 0.1], [1.08, 0.84, 0.1], 0.04);
        run(0.35, 1.08, 0.04, 0.84, 0.1);
      } else if (type === "choke") {
        tube([0, 0.4, 0], [0.56, 1.16, 0], 0.16);
        wheel(0.56, 1.16, 0, 0.31);
      } else wheel(0, 1, 0);
      break;
    case "separator":
    case "dehydrator":
    case "filter": {
      const h = type === "dehydrator" ? 2.1 : type === "separator" ? 1.13 : 0.8,
        r = type === "filter" ? 0.62 : 0.7;
      vessel(h, r);
      if (type === "filter") {
        riser(0, 0, h - 0.02, h + 0.11, r * 1.13, dark);
        riser(0, 0, h + 0.11, h + 0.19, r * 1.12);
      } else if (type === "dehydrator") {
        for (const x of [-0.2, 0.2])
          riser(x, r + 0.1, -0.65, h + 0.25, 0.035, dark);
        for (let y = -0.57; y < h + 0.24; y += 0.22)
          run(-0.2, 0.2, 0.027, y, r + 0.1, dark);
      } else {
        riser(0.62, 0.32, -0.22, 0.86, 0.074, drive);
        riser(0, 0, -1, -0.5, 0.11);
      }
      break;
    }
    case "heater":
      box(0, 0.05, 0, 2.8, 1.52, 1.15, iron);
      riser(0.92, 0, 0.8, 1.78, 0.19, dark);
      for (const x of [-0.9, -0.34, 0.22])
        sphere(x, 0, 0.6, 0.2, dark, [1, 1, 0.4]);
      feet();
      break;
    case "cooler":
      box(0, 0, 0, 3.0, 0.47, 1.72, steel);
      for (let x = -1.3; x <= 1.31; x += 0.18)
        box(x, 0.25, 0, 0.035, 0.06, 1.58, dark);
      for (const x of [-0.72, 0.72]) {
        riser(x, 0, 0.27, 0.47, 0.58, iron);
        for (let k = 0; k < 3; k++) {
          const blade = box(x, 0.49, 0, 0.98, 0.05, 0.13, dark);
          blade.rotation.y = (k * Math.PI) / 3;
        }
      }
      feet();
      break;
    case "exchanger":
    case "launcher":
    case "receiver":
    case "drain": {
      const sign = type === "receiver" ? -1 : 1;
      run(-1, 1, 0.52);
      feet();
      sphere(-1, 0, 0, 0.52, steel, [0.4, 1, 1]);
      sphere(1, 0, 0, 0.52, steel, [0.4, 1, 1]);
      if (type === "launcher" || type === "receiver") {
        flange(-sign * 1.04, 0.65);
        tube([sign * 0.9, 0, 0], [sign * 1.55, 0, 0], 0.51, steel, 0.23);
        riser(-0.47 * sign, 0, 0.4, 0.85, 0.16);
      }
      if (type === "exchanger") {
        flange(-0.87, 0.61);
        flange(0.87, 0.61);
        riser(-0.66, 0, 0.4, 0.86, 0.18);
        riser(0.66, 0, -0.88, -0.4, 0.18);
        run(-1.55, -1, 0.19);
        run(1, 1.55, 0.19);
      }
      if (type === "drain") {
        riser(-0.6, 0, 0.42, 0.88, 0.16);
        riser(0.5, 0, 0.42, 0.77, 0.26);
      }
      break;
    }
    case "tank":
      riser(0, 0, -0.93, 0.83, 0.97);
      tube([0, 0.83, 0], [0, 1.17, 0], 0.98, steel, 0.06);
      run(0.84, 1.35, 0.15, -0.65);
      break;
    case "compressor":
    case "pump":
    case "recip":
      box(0, -0.68, 0, 3.52, 0.18, 1.67, dark);
      motor(-0.83, -0.02, 0);
      if (type === "recip") {
        box(0.68, -0.05, 0, 1.12, 0.82, 0.86, iron);
        for (const z of [-1, 1]) {
          tube([0.66, 0.13, z * 0.18], [0.66, 0.68, z * 0.86], 0.33);
          box(0.66, 0.72, z * 0.86, 0.72, 0.26, 0.49, dark);
        }
      } else {
        sphere(
          0.69,
          0.07,
          0,
          type === "pump" ? 0.57 : 0.79,
          iron,
          [0.81, 1, 1],
        );
        run(1.0, 1.65, 0.24, 0.06);
        flange(1.54, 0.4, 0.06);
        riser(0.73, 0, 0.39, type === "pump" ? 0.83 : 1.14, 0.21);
        if (type === "compressor") run(0.73, 1.38, 0.21, 1.14);
      }
      break;
    case "meter":
    case "orifice":
      spool();
      if (type === "orifice") {
        flange(-0.07, 0.57);
        flange(0.07, 0.57);
        for (const x of [-0.45, 0.45]) riser(x, 0, 0.2, 0.76, 0.06);
      } else {
        for (const x of [-0.54, 0.54])
          tube([x, 0.09, -0.22], [x + 0.19, 0.4, 0.28], 0.105, drive);
        box(0, 0.72, 0, 0.59, 0.48, 0.35, iron);
        riser(0, 0, 0, 0.55, 0.08);
      }
      break;
    case "pressure":
    case "temperature":
    case "differential":
      if (type === "differential") {
        for (const x of [-0.27, 0.27]) riser(x, 0, -0.67, 0.25, 0.066);
        box(0, 0.15, 0, 0.84, 0.35, 0.36, iron);
      } else {
        riser(0, 0, -0.72, 0.35, type === "temperature" ? 0.065 : 0.13);
        riser(0, 0, -0.28, -0.15, 0.24, dark);
      }
      if (type === "temperature") {
        box(0, 0.57, 0, 0.61, 0.44, 0.43, drive);
        box(0.35, 0.57, 0, 0.22, 0.18, 0.18, dark);
      } else gauge(0, 0.59, 0);
      break;
    case "vent":
      riser(0, 0, -0.65, 2.02, 0.17);
      run(-1.26, 0, 0.17, -0.51);
      riser(0, 0, -0.73, -0.6, 0.46, dark);
      break;
    case "arrestor":
      spool();
      tube([-0.9, 0, 0], [-0.5, 0, 0], 0.25, steel, 0.61);
      run(-0.5, 0.5, 0.61);
      tube([0.5, 0, 0], [0.9, 0, 0], 0.61, steel, 0.25);
      flange(-0.08, 0.73);
      flange(0.08, 0.73);
      break;
    case "blowdown":
      spool();
      sphere(0, 0, 0, 0.48, iron);
      riser(0, 0, 0.32, 0.84, 0.2);
      box(0, 1, 0, 0.92, 0.4, 0.52, drive);
      riser(1.34, 0, 0, 0.8, 0.23);
      break;
    case "flare":
      riser(0, 0, -1, 1.5, 0.21);
      tube([0, 1.5, 0], [0, 1.94, 0], 0.22, dark, 0.38);
      riser(0.24, 0, -0.72, 1.79, 0.052, drive);
      for (const z of [-0.6, 0.6])
        tube([-0.42, -1, z], [0, 0.65, 0], 0.06, dark);
      run(-1.25, 0, 0.2, -0.78);
      break;
    case "level":
      riser(0, 0, -1.35, 0.25, 0.055);
      riser(0, 0, -0.18, 0.02, 0.35);
      box(0, 0.48, 0, 0.55, 0.45, 0.43, iron);
      sphere(0, -0.86, 0, 0.16, steel, [1, 1.5, 1]);
      break;
    case "support":
      run(-1.47, 1.47, 0.35);
      box(0, -0.38, 0, 0.79, 0.19, 0.52, iron);
      box(0, -0.66, 0, 0.37, 0.49, 0.38);
      box(0, -0.96, 0, 1.08, 0.13, 0.78, dark);
      break;
    default:
      throw Error("未登记的设备类型 " + type);
  }
  return g;
}
