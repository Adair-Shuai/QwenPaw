import { FIELDS, MODELS, pythonRound, validate } from "./model.mjs";
import {
  calculateStructured,
  normalizeStructure,
  sampleStructured,
} from "./structure.mjs";
import { buildTrajectory, normalizeSurvey } from "./survey.mjs";
import { calculateTrajectory } from "./trajectory-pressure.mjs";
export const VERSION = "1.3.0";
export const INTERVALS = [25, 50, 100, 200, 500];
export function computeScenario(
  parameters,
  model,
  gridFactor = 1,
  structure = null,
  survey = null,
  temperatureBasis = "tvd",
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
  const trajectory = survey ? buildTrajectory(survey) : null;
  const basis = trajectory ? temperatureBasis : "md";
  const geometry = normalized || [
    {
      name: "全井段",
      end: parameters.depth,
      diameter: parameters.diameter,
      angle: parameters.angle,
      roughness: parameters.roughness,
    },
  ];
  const solve = (choice, count) =>
    trajectory
      ? calculateTrajectory(
          parameters,
          choice,
          count,
          geometry,
          trajectory,
          basis,
        )
      : calculateStructured(parameters, choice, count, normalized);
  const result = solve(model, steps);
  const comparison = solve(
    MODELS.find((m) => m !== model),
    steps,
  );
  const refined = solve(model, steps * 2);
  const difference = Math.abs(refined.bottom - result.bottom);
  return {
    result,
    comparison,
    gridFactor,
    structure: normalized,
    survey: trajectory?.survey || null,
    temperatureBasis: basis,
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
    version: 4,
    appVersion: VERSION,
    model: snapshot.result.model,
    parameters: snapshot.result.params,
    gridFactor: snapshot.gridFactor,
    interval,
    structure: snapshot.structure,
    survey: snapshot.survey,
    temperatureBasis: snapshot.temperatureBasis,
  };
}
export function decodeScenario(data) {
  if (
    !data ||
    data.app !== "wellbore-pressure" ||
    ![1, 2, 3, 4].includes(data.version) ||
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
    data.version >= 3 && data.structure !== null
      ? normalizeStructure(data.structure, parameters.depth)
      : null;
  const survey =
    data.version === 4 && data.survey !== null
      ? normalizeSurvey(data.survey)
      : null;
  if (survey && Math.abs(survey.at(-1).md - parameters.depth) > 1e-8)
    throw new Error("方案井斜末测深与总井深不一致。");
  if (data.version === 4 && !["md", "tvd"].includes(data.temperatureBasis))
    throw new Error("方案地温梯度基准无效。");
  return {
    parameters,
    model: data.model,
    gridFactor,
    interval,
    ...(data.version >= 3 ? { structure } : {}),
    ...(data.version === 4
      ? { survey, temperatureBasis: data.temperatureBasis }
      : {}),
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
