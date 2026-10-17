import JSZip from "jszip";
import { parseSurvey, surveyFromRows } from "./survey.mjs";

function xml(text) {
  if (/<!DOCTYPE/i.test(text))
    throw new Error("Excel文件包含不支持的XML声明。");
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length)
    throw new Error("Excel内部数据无法读取。");
  return doc;
}
function elements(root, name) {
  return [...root.getElementsByTagNameNS("*", name)];
}
async function part(zip, name, required = true) {
  const item = zip.file(name);
  if (!item) {
    if (required) throw new Error("Excel文件缺少必要数据：" + name);
    return null;
  }
  return xml(await item.async("string"));
}
export async function readSurveyFile(file) {
  if (file.size > 2 * 1024 * 1024) throw new Error("井斜文件不能超过2 MB。");
  const extension = file.name.split(".").at(-1).toLowerCase();
  if (extension === "xls")
    throw new Error("请将旧版.xls另存为.xlsx或CSV后导入。");
  if (extension !== "xlsx") return parseSurvey(await file.text());
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const files = Object.values(zip.files);
  // JSZip is pinned to 3.10.1. Check central-directory sizes before inflating XML.
  if (
    files.length > 1024 ||
    files.reduce((n, f) => n + (f._data?.uncompressedSize || 0), 0) >
      20 * 1024 * 1024
  )
    throw new Error("Excel展开数据超过20 MB或文件项过多。");
  const workbook = await part(zip, "xl/workbook.xml"),
    rels = await part(zip, "xl/_rels/workbook.xml.rels");
  const sheet = elements(workbook, "sheet").find(
    (s) => !["hidden", "veryHidden"].includes(s.getAttribute("state")),
  );
  if (!sheet) throw new Error("Excel没有可见工作表。");
  const id =
    sheet.getAttribute("r:id") ||
    sheet.getAttributeNS(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      "id",
    );
  const rel = elements(rels, "Relationship").find(
    (r) => r.getAttribute("Id") === id,
  );
  const target = rel?.getAttribute("Target") || "";
  if (
    !target ||
    target.includes("..") ||
    target.includes("\\") ||
    rel.getAttribute("TargetMode") === "External"
  )
    throw new Error("Excel工作表关系无效。");
  const path = target.startsWith("/") ? target.slice(1) : "xl/" + target;
  if (!path.startsWith("xl/worksheets/"))
    throw new Error("Excel工作表路径无效。");
  const data = await part(zip, path),
    sharedDoc = await part(zip, "xl/sharedStrings.xml", false);
  const shared = sharedDoc
    ? elements(sharedDoc, "si").map((si) =>
        elements(si, "t")
          .map((t) => t.textContent)
          .join(""),
      )
    : [];
  const sheetRows = elements(data, "row");
  if (sheetRows.length > 5000)
    throw new Error("Excel工作表超过5000行，请仅保留井斜测点。");
  const rows = sheetRows.map((row) => {
    const result = [];
    for (const cell of elements(row, "c")) {
      const letters = cell.getAttribute("r")?.match(/^[A-Z]+/i)?.[0];
      if (!letters) throw new Error("Excel单元格坐标无效。");
      const index =
        [...letters.toUpperCase()].reduce(
          (n, c) => n * 26 + c.charCodeAt(0) - 64,
          0,
        ) - 1;
      if (index > 255) throw new Error("Excel列数过多。");
      if (elements(cell, "f").length) {
        result[index] = { formula: true };
        continue;
      }
      const value = elements(cell, "v")[0]?.textContent ?? "",
        type = cell.getAttribute("t");
      result[index] =
        type === "s"
          ? shared[Number(value)] ?? ""
          : type === "inlineStr"
          ? elements(cell, "t")
              .map((t) => t.textContent)
              .join("")
          : value;
    }
    return result;
  });
  return surveyFromRows(rows);
}
