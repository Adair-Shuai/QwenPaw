import {
  calculate,
  validate,
  MODELS,
  density,
  frictionFactor,
} from "./model.mjs";

export function uniformStructure(p) {
  return [
    {
      name: "全井段",
      end: p.depth,
      diameter: p.diameter,
      angle: p.angle,
      roughness: p.roughness,
    },
  ];
}

export function normalizeStructure(segments, depth) {
  if (
    typeof depth !== "number" ||
    !Number.isFinite(depth) ||
    depth < 1 ||
    depth > 10000
  )
    throw new Error("请先将总井深设置为 1～10000 m 的有效数值。");
  if (!Array.isArray(segments) || !segments.length || segments.length > 30)
    throw new Error("井身结构须包含 1～30 个连续井段。");
  let start = 0;
  return segments.map((s, i) => {
    const label = `第 ${i + 1} 井段`;
    for (const key of ["end", "diameter", "angle", "roughness"])
      if (typeof s?.[key] !== "number" || !Number.isFinite(s[key]))
        throw new Error(`${label}存在空值或无效数值。`);
    if (s.end - start < 0.1 || s.end > depth + 1e-8)
      throw new Error(
        `${label}终点井深须递增，每段至少 0.1 m，且不超过总井深。`,
      );
    if (i === segments.length - 1 && Math.abs(s.end - depth) > 1e-8)
      throw new Error(`最后井段须到达总井深 ${depth} m。`);
    if (s.diameter < 0.001 || s.diameter > 1)
      throw new Error(`${label}内径须在 1～1000 mm 之间。`);
    if (s.angle < 0 || s.angle > 90)
      throw new Error(`${label}夹角须在 0～90° 之间（相对水平面）。`);
    if (s.roughness < 1e-7 || s.roughness > 0.01 || s.roughness >= s.diameter)
      throw new Error(`${label}粗糙度须在 0.0001～10 mm 之间且小于内径。`);
    const row = {
      name: String(s.name || label).slice(0, 30),
      end: i === segments.length - 1 ? depth : s.end,
      diameter: s.diameter,
      angle: s.angle,
      roughness: s.roughness,
    };
    start = row.end;
    return row;
  });
}

export function sectionAtDepth(segments, depth) {
  return segments.findIndex(
    (s, i) => depth < s.end - 1e-8 || i === segments.length - 1,
  );
}

export function verticalDepth(segments) {
  let start = 0,
    vertical = 0;
  for (const s of segments) {
    vertical += (s.end - start) * Math.sin((s.angle * Math.PI) / 180);
    start = s.end;
  }
  return vertical;
}

export function calculateStructured(p, model, steps, structure = null) {
  validate(p);
  const segments = normalizeStructure(
    structure || uniformStructure(p),
    p.depth,
  );
  if (!structure || segments.length === 1) {
    const s = segments[0];
    return {
      ...calculate(
        { ...p, diameter: s.diameter, angle: s.angle, roughness: s.roughness },
        model,
        steps,
      ),
      params: { ...p },
      segments,
    };
  }
  if (!MODELS.includes(model)) throw new Error("不支持的计算模型。");
  if (!Number.isInteger(steps) || steps < 2 || steps > 50000)
    throw new Error("计算网格数须为 2～50000 的整数。");
  const mass = (density(101325, 293.15, 1) * p.rate) / 86400;
  let pressure = p.pressure * 1e6,
    gravity = 0,
    friction = 0,
    start = 0;
  const rows = [];
  function values(d, s) {
    const temperature = p.temperature + 0.025 * d;
    const rho = density(pressure, temperature, p.z);
    const velocity = mass / ((rho * Math.PI * s.diameter ** 2) / 4);
    const mu = 1.2e-5 * (temperature / 300) ** 0.7;
    const sine = Math.sin((s.angle * Math.PI) / 180);
    const factor =
      frictionFactor(
        (rho * velocity * s.diameter) / mu,
        s.roughness,
        s.diameter,
      ) * (model === "Beggs-Brill" ? 1 + 0.08 * sine ** 2 : 1);
    const row = [
      d,
      pressure / 1e6,
      temperature,
      rho,
      velocity,
      (factor * rho * velocity ** 2) / (2 * s.diameter) / 1000,
      (rho * 9.81 * sine) / 1000,
    ];
    if (!row.every(Number.isFinite))
      throw new Error("当前井身结构导致计算溢出，请调整工况。");
    return row;
  }
  for (const s of segments) {
    // Segment boundaries are exact grid nodes; no cell straddles a change in geometry.
    const cells = Math.max(1, Math.ceil((steps * (s.end - start)) / p.depth));
    const ds = (s.end - start) / cells;
    for (let i = 0; i < cells; i++) {
      const row = values(start + i * ds, s);
      rows.push(row);
      pressure += (row[5] + row[6]) * 1000 * ds;
      gravity += (row[6] * ds) / 1000;
      friction += (row[5] * ds) / 1000;
    }
    start = s.end;
  }
  const last = values(p.depth, segments.at(-1));
  last[5] = rows.at(-1)[5];
  last[6] = rows.at(-1)[6];
  rows.push(last);
  return {
    model,
    params: { ...p },
    segments,
    steps: rows.length - 1,
    rows,
    samples: sampleStructured(rows, segments),
    bottom: last[1],
    gravity,
    friction,
    maxVelocity: Math.max(...rows.map((r) => r[4])),
  };
}

// Pressure is continuous. Geometry-dependent values use the downstream side at
// a boundary and must not be interpolated across the velocity/gradient jump.
export function sampleStructured(rows, segments, interval = 100) {
  const last = rows.at(-1)[0];
  if (!(interval > 0) || !Number.isFinite(interval) || last / interval > 20000)
    throw new Error("采样间隔无效。");
  const depths = [];
  for (let i = 0; i * interval < last - Math.max(1, last) * 1e-12; i++)
    depths.push(i * interval);
  depths.push(last);
  let i = 0;
  return depths.map((d) => {
    while (i < rows.length - 2 && rows[i + 1][0] <= d) i++;
    const a = rows[i],
      b = rows[i + 1],
      t = (d - a[0]) / (b[0] - a[0]);
    const crossing =
      sectionAtDepth(segments, a[0]) !== sectionAtDepth(segments, b[0]);
    return a.map((v, j) =>
      j === 0 ? d : crossing && j >= 4 && t < 1 ? v : v + t * (b[j] - v),
    );
  });
}

export const STRUCTURE_HEADERS = [
  "终点井深_m",
  "内径_mm",
  "夹角_deg",
  "粗糙度_mm",
  "井段名称",
];
export function csvRows(text, delimiter = ",") {
  const rows = [];
  let row = [],
    value = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && (c === delimiter || c === "\n")) {
      row.push(value.replace(/\r$/, ""));
      value = "";
      if (c === "\n") {
        if (row.some((v) => v.trim())) rows.push(row);
        row = [];
      }
    } else value += c;
  }
  if (quoted) throw new Error("CSV引号未闭合。");
  row.push(value.replace(/\r$/, ""));
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
export function parseStructure(text, depth) {
  text = text.replace(/^\uFEFF/, "").trim();
  if (text.startsWith("{") || text.startsWith("[")) {
    const data = JSON.parse(text);
    return normalizeStructure(
      Array.isArray(data) ? data : data.segments,
      depth,
    );
  }
  const [headers, ...rows] = csvRows(text);
  if (!headers || STRUCTURE_HEADERS.some((h, i) => headers[i]?.trim() !== h))
    throw new Error("CSV表头或单位不匹配，请使用本应用的结构模板。");
  return normalizeStructure(
    rows.map((row) => {
      if (row.length !== 5 || row.slice(0, 4).some((v) => !v.trim()))
        throw new Error("CSV每行须包含四个数值及井段名称，不能有空数值。");
      return {
        end: Number(row[0]),
        diameter: Number(row[1]) / 1000,
        angle: Number(row[2]),
        roughness: Number(row[3]) / 1000,
        name: row[4],
      };
    }),
    depth,
  );
}
export function structureCSV(segments) {
  const quote = (v) => `"${String(v).replaceAll('"', '""')}"`;
  return (
    "\uFEFF" +
    [
      STRUCTURE_HEADERS,
      ...segments.map((s) => [
        s.end,
        s.diameter * 1000,
        s.angle,
        s.roughness * 1000,
        s.name,
      ]),
    ]
      .map((r) => r.map(quote).join(","))
      .join("\r\n")
  );
}
