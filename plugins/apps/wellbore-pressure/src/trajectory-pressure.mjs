import { density, frictionFactor } from "./model.mjs";
import { sectionAtDepth, sampleStructured } from "./structure.mjs";
import { trajectoryAt, trajectoryPlot } from "./survey.mjs";

export function calculateTrajectory(
  p,
  model,
  steps,
  segments,
  trajectory,
  temperatureBasis,
) {
  if (Math.abs(trajectory.depth - p.depth) > 1e-8)
    throw new Error(
      `井斜末测深${trajectory.depth} m与总井深${p.depth} m不一致，请重新导入或修正。`,
    );
  if (!["md", "tvd"].includes(temperatureBasis))
    throw new Error("地温梯度基准无效。");
  const nodes = [
    0,
    p.depth,
    ...segments.map((s) => s.end),
    ...trajectory.survey.map((s) => s.md),
  ];
  for (let i = 1; i < steps; i++) nodes.push((p.depth * i) / steps);
  nodes.sort((a, b) => a - b);
  const grid = nodes.filter((d, i) => !i || d - nodes[i - 1] > 1e-8);
  const mass = (density(101325, 293.15, 1) * p.rate) / 86400;
  const positions = grid.map((d) => trajectoryAt(trajectory, d));
  let pressure = p.pressure * 1e6,
    gravity = 0,
    friction = 0;
  const rows = [];
  for (let i = 0; i < grid.length; i++) {
    const d = grid[i],
      pos = positions[i],
      s = segments[sectionAtDepth(segments, d)];
    const temperature =
      p.temperature + 0.025 * (temperatureBasis === "tvd" ? pos.tvd : d);
    if (!(temperature > 0) || !(pressure > 0))
      throw new Error(
        "轨迹与工况导致非正温度或压力，请检查输入和模型适用范围。",
      );
    const rho = density(pressure, temperature, p.z),
      velocity = mass / ((rho * Math.PI * s.diameter ** 2) / 4);
    const mu = 1.2e-5 * (temperature / 300) ** 0.7;
    const vertical =
      i < grid.length - 1
        ? trajectoryAt(trajectory, (d + grid[i + 1]) / 2).vertical
        : pos.vertical;
    const f =
      frictionFactor(
        (rho * velocity * s.diameter) / mu,
        s.roughness,
        s.diameter,
      ) * (model === "Beggs-Brill" ? 1 + 0.08 * vertical ** 2 : 1);
    const fg = (f * rho * velocity ** 2) / (2 * s.diameter);
    const slope =
      i < grid.length - 1
        ? (positions[i + 1].tvd - pos.tvd) / (grid[i + 1] - d)
        : vertical;
    const gg = rho * 9.81 * slope;
    const row = [
      d,
      pressure / 1e6,
      temperature,
      rho,
      velocity,
      fg / 1000,
      gg / 1000,
    ];
    if (!row.every(Number.isFinite))
      throw new Error("轨迹压力计算出现数值溢出。");
    if (i === grid.length - 1) {
      row[5] = rows.at(-1)[5];
      row[6] = rows.at(-1)[6];
    }
    rows.push(row);
    if (i < grid.length - 1) {
      const ds = grid[i + 1] - d;
      const dpGravity = rho * 9.81 * (positions[i + 1].tvd - pos.tvd),
        dpFriction = fg * ds;
      pressure += dpGravity + dpFriction;
      gravity += dpGravity / 1e6;
      friction += dpFriction / 1e6;
    }
  }
  return {
    model,
    params: { ...p },
    steps: rows.length - 1,
    segments,
    rows,
    samples: sampleStructured(rows, segments),
    bottom: rows.at(-1)[1],
    gravity,
    friction,
    maxVelocity: Math.max(...rows.map((r) => r[4])),
    survey: trajectory.survey,
    stations: trajectory.stations,
    trajectory: trajectoryPlot(
      trajectory,
      segments.map((s) => s.end),
    ),
    positions,
    temperatureBasis,
  };
}
