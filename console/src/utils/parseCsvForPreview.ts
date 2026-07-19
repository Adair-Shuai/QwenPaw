/**
 * parseCsvForPreview — 轻量级 CSV/TSV 解析器
 *
 * 遵循 RFC 4180，支持：
 * - 引号包裹的字段（含逗号、换行、引号）
 * - 引号转义（"" → "）
 * - 自动检测分隔符（, \t ; |）
 * - 可选首行表头
 * - 大文件流式行数上限保护
 *
 * 不依赖第三方库，纯字符串状态机实现。
 */

export interface ParsedCsv {
  /** 表头（若 hasHeader=false 则为 ["col1","col2",...]） */
  headers: string[];
  /** 数据行（每行是字段数组，与 headers 对齐） */
  rows: string[][];
  /** 总行数（不含表头） */
  rowCount: number;
  /** 实际使用的分隔符 */
  delimiter: string;
  /** 是否截断（超过 maxRows） */
  truncated: boolean;
}

export interface ParseCsvOptions {
  /** 分隔符，不传则自动检测 */
  delimiter?: string;
  /** 首行是否为表头，默认 true */
  hasHeader?: boolean;
  /** 最大解析行数，默认 50000（超出截断） */
  maxRows?: number;
}

/**
 * 自动检测分隔符：取首行中各候选分隔符出现次数最多的。
 */
function detectDelimiter(firstLine: string): string {
  const candidates = [",", "\t", ";", "|"];
  let best = ",";
  let bestCount = 0;
  for (const c of candidates) {
    // 避免在引号内计数：粗略按整行 count
    const count = firstLine.split(c).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = c;
    }
  }
  return best;
}

/**
 * 解析一行 CSV（处理引号、转义、嵌入式换行）。
 * 返回 [fields, consumedLength]。
 */
function parseLine(
  text: string,
  start: number,
  delimiter: string,
): [string[], number] {
  const fields: string[] = [];
  let i = start;
  let field = "";
  let inQuotes = false;
  const len = text.length;

  while (i < len) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        // 双引号转义
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        // 引号结束
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    // 非引号状态
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === delimiter) {
      fields.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      // \r\n 或 \r → 行结束
      if (text[i + 1] === "\n") {
        i += 2;
      } else {
        i++;
      }
      fields.push(field);
      return [fields, i];
    }
    if (ch === "\n") {
      i++;
      fields.push(field);
      return [fields, i];
    }
    field += ch;
    i++;
  }

  // 文件末尾
  fields.push(field);
  return [fields, i];
}

/**
 * 解析 CSV 文本。
 */
export function parseCsv(
  text: string,
  options: ParseCsvOptions = {},
): ParsedCsv {
  const {
    delimiter: forcedDelimiter,
    hasHeader = true,
    maxRows = 50000,
  } = options;

  if (!text) {
    return { headers: [], rows: [], rowCount: 0, delimiter: ",", truncated: false };
  }

  // 检测分隔符
  const firstNewline = text.search(/\r?\n/);
  const firstLine =
    firstNewline >= 0 ? text.slice(0, firstNewline) : text;
  const delimiter = forcedDelimiter ?? detectDelimiter(firstLine);

  const rows: string[][] = [];
  let pos = 0;
  let truncated = false;
  const len = text.length;

  while (pos < len) {
    // 跳过空行（连续换行）
    if (text[pos] === "\r" || text[pos] === "\n") {
      pos += text[pos] === "\r" && text[pos + 1] === "\n" ? 2 : 1;
      continue;
    }
    const [fields, nextPos] = parseLine(text, pos, delimiter);
    if (nextPos === pos) break; // 防止死循环
    pos = nextPos;
    rows.push(fields);
    if (rows.length >= maxRows + (hasHeader ? 1 : 0)) {
      truncated = true;
      break;
    }
  }

  let headers: string[];
  let dataRows: string[][];
  if (hasHeader && rows.length > 0) {
    headers = rows[0];
    dataRows = rows.slice(1);
  } else {
    const colCount = rows[0]?.length ?? 0;
    headers = Array.from({ length: colCount }, (_, i) => `col${i + 1}`);
    dataRows = rows;
  }

  return {
    headers,
    rows: dataRows,
    rowCount: dataRows.length,
    delimiter,
    truncated,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 列类型推断（用于表格对齐/着色）
// ─────────────────────────────────────────────────────────────────────────────

export type ColumnType = "number" | "date" | "boolean" | "string" | "empty";

/**
 * 推断列类型：扫描前 100 行采样。
 */
export function inferColumnType(
  colIndex: number,
  rows: string[][],
): ColumnType {
  const sample = rows.slice(0, 100).map((r) => r[colIndex]).filter((v) => v !== undefined && v !== "");
  if (sample.length === 0) return "empty";

  let numCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  for (const v of sample) {
    const trimmed = v.trim();
    // 数字（含科学计数、负号、千分位逗号、百分号）
    if (/^-?[\d,]+\.?\d*%?$/.test(trimmed) || /^-?\d+e-?\d+$/i.test(trimmed)) {
      numCount++;
      continue;
    }
    // 布尔
    if (/^(true|false|yes|no|0|1)$/i.test(trimmed)) {
      boolCount++;
      continue;
    }
    // 日期（ISO / yyyy-mm-dd / yyyy/mm/dd）
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(trimmed)) {
      dateCount++;
      continue;
    }
  }

  const total = sample.length;
  if (numCount / total > 0.8) return "number";
  if (dateCount / total > 0.8) return "date";
  if (boolCount / total > 0.8) return "boolean";
  return "string";
}
