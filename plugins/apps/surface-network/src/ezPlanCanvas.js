import { arcPoints, arcRadius, curveSteps } from "./ezCurves.js";
// A native canvas keeps the full XY plan available on machines without WebGL2.
export function createPlanCanvas(mount, data, events) {
  const canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");
  if (!ctx) throw Error("此环境无法绘制工区图面");
  canvas.tabIndex = 0;
  canvas.setAttribute("aria-label", "工区二维总平面图");
  mount.appendChild(canvas);
  const {
    tubeCoords: tubes,
    tubeOwners,
    faceCoords: faces,
    faceOwners,
    arcCoords: arcs,
    arcOwners,
    arcExtents,
  } = data;
  function paths(only) {
    const sets = Array.from({ length: 2 }, () => ({
      trace: new Path2D(),
      fill: new Path2D(),
    }));
    for (let i = 0; i < tubeOwners.length; i++) {
      const id = tubeOwners[i],
        p = 9 * i;
      if (only && !only.has(id)) continue;
      const trace = sets[id ? 1 : 0].trace,
        ax = tubes[p + 2],
        ay = tubes[p + 3],
        bx = tubes[p + 5],
        by = tubes[p + 6];
      trace.moveTo(ax, ay);
      trace.lineTo(bx, by);
      if (ax === bx && ay === by) {
        trace.moveTo(ax + tubes[p + 8], ay);
        trace.arc(ax, ay, tubes[p + 8], 0, Math.PI * 2);
      }
    }
    for (let n = 0; n < arcOwners.length; n++) {
      const id = arcOwners[n],
        i = 13 * n;
      if (only && !only.has(id)) continue;
      const circle = new Path2D(),
        sweep = arcs[i + 11];
      circle.arc(0, 0, 1, 0, sweep, sweep < 0);
      sets[id ? 1 : 0].trace.addPath(
        circle,
        new DOMMatrix([
          arcs[i + 5],
          arcs[i + 6],
          arcs[i + 8],
          arcs[i + 9],
          arcs[i + 2],
          arcs[i + 3],
        ]),
      );
    }
    for (let i = 0; i < faceOwners.length; i += 3) {
      const id = faceOwners[i],
        p = 3 * i;
      if (only && !only.has(id)) continue;
      const path = sets[id ? 1 : 0].fill;
      path.moveTo(faces[p], faces[p + 1]);
      path.lineTo(faces[p + 3], faces[p + 4]);
      path.lineTo(faces[p + 6], faces[p + 7]);
      path.closePath();
    }
    return sets;
  }
  const all = paths(0);
  let selectedPaths = null,
    partnerPaths = null,
    hide = false,
    frame = 0,
    dead = false,
    zoomFactor = 1,
    w = 0,
    h = 0,
    cx = 0,
    cy = 0,
    wpp = 1,
    fitBox = data.bounds;
  function project(p) {
    return [(p[0] - cx) / wpp + w / 2, (cy - p[1]) / wpp + h / 2, 0];
  }
  function draw() {
    if (dead || !w || !h || !mount.clientWidth) return;
    const [lo, hi] = fitBox;
    wpp =
      (Math.max((hi[0] - lo[0]) / w, (hi[1] - lo[1]) / h, 1e-8) * 1.12) /
      zoomFactor;
    const ratio = canvas.width / w,
      dark = document.documentElement.classList.contains("dark-mode");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(
      ratio / wpp,
      0,
      0,
      -ratio / wpp,
      (w / 2 - cx / wpp) * ratio,
      (h / 2 + cy / wpp) * ratio,
    );
    for (let i = 0; i < all.length; i++) {
      if (hide && !i) continue;
      ctx.fillStyle = i
        ? dark
          ? "#75acbc"
          : "#456d7c"
        : dark
        ? "#6c7278"
        : "#aeb9bd";
      ctx.fill(all[i].fill);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = wpp;
      ctx.stroke(all[i].trace);
    }
    for (const [lines, color] of [
      [selectedPaths, dark ? "#ffb840" : "#dd640d"],
      [partnerPaths, "#9361dc"],
    ]) {
      if (lines) {
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.fill(lines.fill);
        ctx.lineWidth = 2 * wpp;
        ctx.stroke(lines.trace);
      }
    }
    events.onDraw(wpp, project, w, h);
  }
  function invalidate() {
    if (!dead && !frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        draw();
      });
  }
  function resize() {
    const width = mount.clientWidth,
      height = mount.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    w = width;
    h = height;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    invalidate();
  }
  function fit(bounds) {
    fitBox = bounds;
    cx = (bounds[0][0] + bounds[1][0]) / 2;
    cy = (bounds[0][1] + bounds[1][1]) / 2;
    zoomFactor = 1;
    invalidate();
  }
  function zoom(factor, x = w / 2, y = h / 2) {
    const next = Math.min(1e7, Math.max(0.02, zoomFactor * factor)),
      newWpp = (wpp * zoomFactor) / next;
    cx += (x - w / 2) * (wpp - newWpp);
    cy -= (y - h / 2) * (wpp - newWpp);
    zoomFactor = next;
    invalidate();
  }
  function wheel(e) {
    e.preventDefault();
    const b = canvas.getBoundingClientRect();
    zoom(
      Math.exp(-Math.max(-300, Math.min(300, e.deltaY)) * 0.002),
      e.clientX - b.left,
      e.clientY - b.top,
    );
  }
  let start = null;
  function down(e) {
    if (e.isPrimary && e.button === 0) {
      start = [e.clientX, e.clientY, cx, cy];
      canvas.setPointerCapture(e.pointerId);
    }
  }
  function move(e) {
    if (!start || !e.isPrimary) return;
    cx = start[2] - (e.clientX - start[0]) * wpp;
    cy = start[3] + (e.clientY - start[1]) * wpp;
    invalidate();
  }
  function up(e) {
    if (!start || !e.isPrimary) return;
    const clicked = Math.hypot(start[0] - e.clientX, start[1] - e.clientY) < 4;
    start = null;
    if (!clicked) return;
    const b = canvas.getBoundingClientRect(),
      x = cx + (e.clientX - b.left - w / 2) * wpp,
      y = cy - (e.clientY - b.top - h / 2) * wpp;
    let best = 6 * wpp,
      hit = 0;
    for (let i = 0; i < tubeOwners.length; i++) {
      const id = tubeOwners[i],
        p = 9 * i;
      if (!id) continue;
      const ax = tubes[p + 2],
        ay = tubes[p + 3],
        dx = tubes[p + 5] - ax,
        dy = tubes[p + 6] - ay,
        r = tubes[p + 8],
        tol = best + r;
      if (
        x < Math.min(ax, ax + dx) - tol ||
        x > Math.max(ax, ax + dx) + tol ||
        y < Math.min(ay, ay + dy) - tol ||
        y > Math.max(ay, ay + dy) + tol
      )
        continue;
      const k = Math.max(
        0,
        Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)),
      );
      const d = Math.max(0, Math.hypot(x - ax - k * dx, y - ay - k * dy) - r);
      if (d < best) {
        hit = id;
        best = d;
      }
    }
    for (let n = 0; n < arcOwners.length && best > 0; n++) {
      const id = arcOwners[n],
        i = 13 * n,
        b = 6 * n;
      if (
        !id ||
        x < arcExtents[b] - best ||
        x > arcExtents[b + 3] + best ||
        y < arcExtents[b + 1] - best ||
        y > arcExtents[b + 4] + best
      )
        continue;
      const steps = curveSteps(arcRadius(arcs, i), arcs[i + 11], wpp);
      let lastX, lastY;
      arcPoints(arcs, i, steps, (px, py, _z, v) => {
        if (v) {
          const dx = px - lastX,
            dy = py - lastY;
          const t = Math.max(
            0,
            Math.min(
              1,
              ((x - lastX) * dx + (y - lastY) * dy) / (dx * dx + dy * dy || 1),
            ),
          );
          const d = Math.max(
            0,
            Math.hypot(x - lastX - t * dx, y - lastY - t * dy) - arcs[i + 12],
          );
          if (d < best) {
            best = d;
            hit = id;
          }
        }
        lastX = px;
        lastY = py;
      });
    }
    if (!hit)
      for (let i = 0; i < faceOwners.length; i += 3) {
        const id = faceOwners[i],
          p = 3 * i;
        if (!id) continue;
        const ax = faces[p],
          ay = faces[p + 1],
          ux = faces[p + 3] - ax,
          uy = faces[p + 4] - ay,
          vx = faces[p + 6] - ax,
          vy = faces[p + 7] - ay,
          det = ux * vy - uy * vx;
        if (!det) continue;
        const u = ((x - ax) * vy - (y - ay) * vx) / det,
          v = (ux * (y - ay) - uy * (x - ax)) / det;
        if (u >= 0 && v >= 0 && u + v <= 1) hit = id;
      }
    if (hit) events.onPick(data.owners[hit].key);
  }
  function key(e) {
    if (e.key === "Home") events.onFit();
    else if (e.key === "+" || e.key === "=") zoom(1.6);
    else if (e.key === "-") zoom(1 / 1.6);
    else if (e.key === "ArrowLeft") cx -= wpp * w * 0.15;
    else if (e.key === "ArrowRight") cx += wpp * w * 0.15;
    else if (e.key === "ArrowUp") cy += wpp * h * 0.15;
    else if (e.key === "ArrowDown") cy -= wpp * h * 0.15;
    else return;
    e.preventDefault();
    invalidate();
  }
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", () => {
    start = null;
  });
  canvas.addEventListener("wheel", wheel, { passive: false });
  canvas.addEventListener("keydown", key);
  const ob = new ResizeObserver(resize),
    theme = new MutationObserver(invalidate);
  ob.observe(mount);
  theme.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  resize();
  fit(fitBox);
  return {
    fit,
    zoom,
    setMode() {},
    refresh: invalidate,
    select(ids, others = []) {
      selectedPaths = ids.length ? paths(new Set(ids))[1] : null;
      partnerPaths = others.length ? paths(new Set(others))[1] : null;
      invalidate();
    },
    hideContext(v) {
      hide = v;
      invalidate();
    },
    dispose() {
      dead = true;
      if (frame) cancelAnimationFrame(frame);
      ob.disconnect();
      theme.disconnect();
      canvas.remove();
    },
  };
}
