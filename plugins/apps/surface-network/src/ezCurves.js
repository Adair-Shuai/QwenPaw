const turn = Math.PI * 2;
export const maxCurveSteps = 48;
// Limit the chord's deviation from the circular arc to about a third of a pixel.
export function curveSteps(major, sweep, pixel) {
  const step = Math.max(
    Math.PI / 24,
    Math.min(
      Math.PI / 3,
      2 * Math.acos(Math.max(-1, 1 - Math.max(1e-12, pixel * 0.32) / major)),
    ),
  );
  return Math.min(
    maxCurveSteps,
    Math.max(2, Math.ceil(Math.abs(sweep) / step)),
  );
}
export function arcRadius(rows, i) {
  return Math.hypot(rows[i + 5], rows[i + 6], rows[i + 7]);
}
export function arcPoints(rows, i, steps, visit) {
  for (let k = 0; k <= steps; k++) {
    const t = rows[i + 11] * (k / steps),
      c = Math.cos(t),
      s = Math.sin(t);
    visit(
      rows[i + 2] + rows[i + 5] * c + rows[i + 8] * s,
      rows[i + 3] + rows[i + 6] * c + rows[i + 9] * s,
      rows[i + 4] + rows[i + 7] * c + rows[i + 10] * s,
      k,
    );
  }
}
// Extrema of C + U cos(t) + V sin(t) within the signed source sweep.
export function arcBounds(rows, i) {
  const sweep = rows[i + 11],
    radius = rows[i + 12],
    bounds = [[], []];
  const inside = (t) => {
    const forward = (((Math.sign(sweep) * t) % turn) + turn) % turn;
    return forward <= Math.abs(sweep) + 1e-12;
  };
  for (let k = 0; k < 3; k++) {
    const c = rows[i + 2 + k],
      u = rows[i + 5 + k],
      v = rows[i + 8 + k];
    const mid = Math.atan2(v, u),
      length = Math.hypot(u, v);
    const end = c + u * Math.cos(sweep) + v * Math.sin(sweep);
    bounds[0][k] =
      Math.min(c + u, end, inside(mid + Math.PI) ? c - length : Infinity) -
      radius;
    bounds[1][k] =
      Math.max(c + u, end, inside(mid) ? c + length : -Infinity) + radius;
  }
  return bounds;
}
