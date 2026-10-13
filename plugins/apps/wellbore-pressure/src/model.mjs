// Faithful port of 代码/models/pressure_model.py; SI units inside the solver.
export const DEFAULTS = Object.freeze({ pressure: 8, temperature: 300, depth: 1000, diameter: 0.08, rate: 50000, roughness: 0.00001, angle: 90, z: 0.9 });
export const FIELDS = [
  ['pressure', '井口绝对压力', 'MPa', 0.1, 100, 0.1],
  ['temperature', '井口温度', 'K', 200, 500, 1],
  ['depth', '沿井筒长度', 'm', 1, 10000, 1],
  ['diameter', '油管内径', 'm', 0.001, 1, 0.001],
  ['rate', '标况产气量', 'm³/d', 1, 100000000, 1000],
  ['roughness', '管壁粗糙度', 'm', 0.0000001, 0.01, 0.000001],
  ['angle', '与水平面夹角', '°', 0, 90, 1],
  ['z', '压缩因子 Z', '—', 0.1, 2, 0.01],
];
export const MODELS = ['Orkiszewski', 'Beggs-Brill'];
export const COLUMNS = ['井深_m', '压力_MPa', '温度_K', '气体密度_kgm3', '流速_ms', '摩阻压降梯度_kPam', '重力压降梯度_kPam'];
export function validate(p) {
  for (const [key, label, unit, min, max] of FIELDS) {
    if (typeof p[key] !== 'number' || !Number.isFinite(p[key]) || p[key] < min || p[key] > max) throw new Error(`${label}须为 ${min}～${max} ${unit} 之间的有效数值。`);
  }
  if (p.roughness >= p.diameter) throw new Error('管壁粗糙度必须小于油管内径。');
}
export function density(pressure, temperature, z) { return pressure * 0.018 / (z * 8.314 * temperature); }
export function frictionFactor(re, roughness, diameter) {
  re = Math.max(re, 1);
  return re < 2000 ? 64 / re : 0.25 / Math.log10(roughness / (3.7 * diameter) + 5.74 / re ** 0.9) ** 2;
}
// Python round uses ties-to-even, unlike Math.round.
export function pythonRound(x) { const f = Math.floor(x); return x - f === 0.5 ? (f % 2 ? f + 1 : f) : Math.round(x); }
export function calculate(p, model = 'Orkiszewski', steps = Math.max(300, pythonRound(p.depth))) {
  validate(p);
  if (!MODELS.includes(model)) throw new Error('不支持的计算模型。');
  if (!Number.isInteger(steps) || steps < 2 || steps > 50000) throw new Error('计算网格数须为 2～50000 的整数。');
  const dz = p.depth / steps;
  const theta = p.angle * Math.PI / 180;
  const mass = density(101325, 293.15, 1) * p.rate / 86400;
  const area = Math.PI * p.diameter ** 2 / 4;
  const correction = model === 'Beggs-Brill' ? 1 + 0.08 * Math.sin(theta) ** 2 : 1;
  let pressure = p.pressure * 1e6, gravity = 0, friction = 0;
  const rows = [];
  for (let i = 0; i <= steps; i++) {
    const depth = i * dz, temperature = p.temperature + 0.025 * depth;
    const rho = density(pressure, temperature, p.z), velocity = mass / (rho * area);
    const mu = 1.2e-5 * (temperature / 300) ** 0.7;
    const f = frictionFactor(rho * velocity * p.diameter / mu, p.roughness, p.diameter) * correction;
    const gg = rho * 9.81 * Math.sin(theta), fg = f * rho * velocity ** 2 / (2 * p.diameter);
    const row = [depth, pressure / 1e6, temperature, rho, velocity,
      i === steps ? rows[i - 1][5] : fg / 1000, i === steps ? rows[i - 1][6] : gg / 1000];
    if (!row.every(Number.isFinite)) throw new Error('当前参数导致计算溢出，请调整工况。');
    rows.push(row);
    if (i < steps) { pressure += (gg + fg) * dz; gravity += gg * dz / 1e6; friction += fg * dz / 1e6; }
  }
  const maxVelocity = Math.max(...rows.map(r => r[4]));
  return { model, params: { ...p }, steps, rows, samples: sample(rows), bottom: rows.at(-1)[1], gravity, friction, maxVelocity };
}
export function sample(rows, interval = 100) {
  if (!(interval > 0) || !Number.isFinite(interval) || !rows.length) throw new Error('采样间隔和计算结果无效。');
  const last = rows.at(-1)[0], depths = [];
  for (let d = 0; d < last; d += interval) depths.push(d);
  depths.push(last);
  let i = 0;
  return depths.map(d => {
    while (i < rows.length - 2 && rows[i + 1][0] < d) i++;
    const a = rows[i], b = rows[i + 1], t = (d - a[0]) / (b[0] - a[0]);
    return a.map((v, j) => j === 0 ? d : v + t * (b[j] - v));
  });
}
