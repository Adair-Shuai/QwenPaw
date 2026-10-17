import { FIELDS, MODELS, pythonRound, validate } from "./model.mjs";
import {
  calculateStructured,
  normalizeStructure,
  sampleStructured,
} from "./structure.mjs";
export const VERSION = "1.2.0";
export const INTERVALS = [25, 50, 100, 200, 500];
export function computeScenario(
  parameters,
  model,
  gridFactor = 1,
  structure = null,
) {
  const normalized = structure
    ? normalizeStructure(structure, parameters.depth)
    : null;
  if (normalized) {
    const first = normalized[0];
    parameters = {
      ...parameters,
      diameter: first.diameter,
      angle: first.angle,
      roughness: first.roughness,
    };
  }
  validate(parameters);
  if (![1, 2].includes(gridFactor)) throw new Error("网格模式无效。");
  const steps = Math.max(300, pythonRound(parameters.depth)) * gridFactor;
  const result = calculateStructured(parameters, model, steps, normalized);
  const comparison = calculateStructured(
    parameters,
    MODELS.find((m) => m !== model),
    steps,
    normalized,
  );
  const refined = calculateStructured(parameters, model, steps * 2, normalized);
  const difference = Math.abs(refined.bottom - result.bottom);
  return {
    result,
    comparison,
    gridFactor,
    structure: normalized,
    quality: {
      refinedSteps: refined.steps,
      refinedBottom: refined.bottom,
      difference,
      relativePercent: (difference / Math.abs(refined.bottom)) * 100,
    },
  };
}
export function sampledScenario(snapshot, interval) {
  if (!INTERVALS.includes(interval)) throw new Error("采样间隔无效。");
  return {
    ...snapshot,
    interval,
    result: {
      ...snapshot.result,
      samples: sampleStructured(
        snapshot.result.rows,
        snapshot.result.segments,
        interval,
      ),
    },
    comparison: {
      ...snapshot.comparison,
      samples: sampleStructured(
        snapshot.comparison.rows,
        snapshot.comparison.segments,
        interval,
      ),
    },
  };
}
export function encodeScenario(snapshot, interval) {
  return {
    app: "wellbore-pressure",
    version: 3,
    appVersion: VERSION,
    model: snapshot.result.model,
    parameters: snapshot.result.params,
    gridFactor: snapshot.gridFactor,
    interval,
    structure: snapshot.structure,
  };
}
export function decodeScenario(data) {
  if (
    !data ||
    data.app !== "wellbore-pressure" ||
    ![1, 2, 3].includes(data.version) ||
    !MODELS.includes(data.model)
  )
    throw new Error("不是受支持的井筒压力方案文件。");
  const parameters = Object.fromEntries(
    FIELDS.map(([k]) => [k, data.parameters?.[k]]),
  );
  validate(parameters);
  const gridFactor = data.version === 1 ? 1 : data.gridFactor;
  const interval = data.version === 1 ? 100 : data.interval;
  if (![1, 2].includes(gridFactor) || !INTERVALS.includes(interval))
    throw new Error("方案中的网格模式或采样间隔无效。");
  const structure =
    data.version === 3 && data.structure !== null
      ? normalizeStructure(data.structure, parameters.depth)
      : null;
  return {
    parameters,
    model: data.model,
    gridFactor,
    interval,
    ...(data.version === 3 ? { structure } : {}),
  };
}
export function changedFields(a, b) {
  return FIELDS.filter(([k]) => a[k] !== b[k]).map(([k, l, u]) => ({
    key: k,
    label: l,
    unit: u,
    before: a[k],
    after: b[k],
  }));
}
