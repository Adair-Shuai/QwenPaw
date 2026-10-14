import JSZip from "jszip";
import { FIELDS, COLUMNS } from "./model.mjs";
import { VERSION } from "./scenario.mjs";
const xml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
export async function workbook(
  result,
  comparison,
  { interval = 100, quality = null, baseline = null } = {},
) {
  const zip = new JSZip();
  const sheets = [
    [
      "计算说明与参数",
      [
        ["井筒压力计算", VERSION],
        ["计算模型", result.model + "（原程序单气相简化版）"],
        ["计算网格数", result.steps],
        ["采样间隔", interval, "m"],
        ...FIELDS.map(([k, l, u]) => [l, result.params[k], u]),
        ["井底压力", result.bottom, "MPa"],
        ["重力累计压差", result.gravity, "MPa"],
        ["摩阻累计压差", result.friction, "MPa"],
        ["角度定义", "水平为0°，垂直为90°"],
        ["适用范围", "单气相采气；不含多相流、注气方向和加速项"],
        ["温度梯度", 0.025, "K/m"],
        ["气体摩尔质量", 0.018, "kg/mol"],
        ["标况压力", 101325, "Pa"],
        ["标况温度", 293.15, "K"],
        ["计算方法", "显式逐段积分；气体黏度=1.2e-5×(T/300)^0.7 Pa·s；常Z"],
        ["Beggs-Brill差异", "原代码仅将摩阻乘以1+0.08×sin²(θ)"],
      ],
    ],
    [`${interval}m采样`, [COLUMNS, ...result.samples]],
    ["完整剖面", [COLUMNS, ...result.rows]],
    [
      "模型对比",
      [
        ["井深_m", `${result.model}_MPa`, `${comparison.model}_MPa`],
        ...result.samples.map((r, i) => [r[0], r[1], comparison.samples[i][1]]),
      ],
    ],
  ];
  if (quality)
    sheets.push([
      "计算检查",
      [
        ["项目", "数值", "单位"],
        ["当前网格数", result.steps, ""],
        ["加密网格数", quality.refinedSteps, ""],
        ["当前井底压力", result.bottom, "MPa"],
        ["加密井底压力", quality.refinedBottom, "MPa"],
        ["绝对差异", quality.difference, "MPa"],
        ["相对差异", quality.relativePercent, "%"],
        ["说明", "仅检查数值离散误差，不等于现场精度验证", ""],
      ],
    ]);
  if (baseline)
    sheets.push([
      "工况对比",
      [
        ["项目", "固定基准", "当前结果", "单位"],
        ["模型", baseline.model, result.model, ""],
        ["网格数", baseline.steps, result.steps, ""],
        ...FIELDS.map(([k, l, u]) => [
          l,
          baseline.params[k],
          result.params[k],
          u,
        ]),
        ["井底压力", baseline.bottom, result.bottom, "MPa"],
        ["重力压差", baseline.gravity, result.gravity, "MPa"],
        ["摩阻压差", baseline.friction, result.friction, "MPa"],
      ],
    ]);
  const main = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const rel =
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets
      .map(
        (_, i) =>
          `<Override PartName="/xl/worksheets/sheet${
            i + 1
          }.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
      )
      .join("")}</Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  );
  zip.file(
    "xl/workbook.xml",
    `<workbook xmlns="${main}" xmlns:r="${rel}"><sheets>${sheets
      .map(
        ([name], i) =>
          `<sheet name="${name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
      )
      .join("")}</sheets></workbook>`,
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
      .map(
        (_, i) =>
          `<Relationship Id="rId${
            i + 1
          }" Type="${rel}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
      )
      .join("")}</Relationships>`,
  );
  sheets.forEach(([, rows], i) =>
    zip.file(
      `xl/worksheets/sheet${i + 1}.xml`,
      `<worksheet xmlns="${main}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="27" customWidth="1"/><col min="2" max="8" width="25" customWidth="1"/></cols><sheetData>${rows
        .map(
          (row, r) =>
            `<row r="${r + 1}">${row
              .map((v, c) =>
                typeof v === "number"
                  ? `<c r="${String.fromCharCode(65 + c)}${
                      r + 1
                    }"><v>${v}</v></c>`
                  : `<c r="${String.fromCharCode(65 + c)}${
                      r + 1
                    }" t="inlineStr"><is><t>${xml(v)}</t></is></c>`,
              )
              .join("")}</row>`,
        )
        .join("")}</sheetData></worksheet>`,
    ),
  );
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
export function download(data, name, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
