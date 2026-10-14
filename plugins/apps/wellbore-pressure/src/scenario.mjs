import {
  FIELDS,
  MODELS,
  calculate,
  pythonRound,
  sample,
  validate,
} from "./model.mjs";
export const VERSION = "1.1.0";
export const INTERVALS = [25, 50, 100, 200, 500];
export function computeScenario(parameters, model, gridFactor = 1) {
  validate(parameters);
  if (![1, 2].includes(gridFactor)) throw new Error("网格模式无效。");
  const steps = Math.max(300, pythonRound(parameters.depth)) * gridFactor;
  const result = calculate(parameters, model, steps);
  const comparison = calculate(
    parameters,
    MODELS.find((m) => m !== model),
    steps,
  );
  const refined = calculate(parameters, model, steps * 2);
  const difference = Math.abs(refined.bottom - result.bottom);
  return {
    result,
    comparison,
    gridFactor,
    quality: {
      refinedSteps: steps * 2,
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
      samples: sample(snapshot.result.rows, interval),
    },
    comparison: {
      ...snapshot.comparison,
      samples: sample(snapshot.comparison.rows, interval),
    },
  };
}
export function encodeScenario(snapshot, interval) {
  return {
    app: "wellbore-pressure",
    version: 2,
    appVersion: VERSION,
    model: snapshot.result.model,
    parameters: snapshot.result.params,
    gridFactor: snapshot.gridFactor,
    interval,
  };
}
export function decodeScenario(data) {
  if (
    !data ||
    data.app !== "wellbore-pressure" ||
    ![1, 2].includes(data.version) ||
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
  return { parameters, model: data.model, gridFactor, interval };
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
