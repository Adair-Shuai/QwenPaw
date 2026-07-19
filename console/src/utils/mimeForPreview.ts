/**
 * mimeForPreview — 预览专用的 MIME 解析 + 二进制嗅探
 *
 * 设计灵感来自 LeAgent 的 lib/mimeForPreview.ts：
 * - 后端/上传方给出的 MIME 经常不准（统一为 application/octet-stream 或 text/plain）
 * - 需要结合「扩展名 + 文件头魔数 + 文本采样」三重判定
 * - 提供「这个 MIME 属于哪一类预览」的便捷判断函数
 *
 * 核心导出：
 * - resolveEffectiveMime(filename, declaredMime?, sample?)  真实 MIME 解析
 * - looksLikeBinaryString(sample)                           文本采样嗅探
 * - looksLikePdf(sample) / isOfficeOoxml(sample)            魔数嗅探
 * - isImageMime / isPdfMime / isOfficeDocMime / ...         分类判断
 */

// ─────────────────────────────────────────────────────────────────────────────
// 扩展名 → MIME 映射表
// ─────────────────────────────────────────────────────────────────────────────

const EXT_TO_MIME: Record<string, string> = {
  // 文本
  txt: "text/plain",
  md: "text/markdown",
  markdown: "text/markdown",
  mdx: "text/markdown",
  html: "text/html",
  htm: "text/html",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  json: "application/json",
  jsonc: "application/json",
  xml: "application/xml",
  yaml: "application/x-yaml",
  yml: "application/x-yaml",
  toml: "application/x-toml",
  ini: "text/x-ini",
  cfg: "text/x-ini",
  log: "text/plain",

  // 代码
  js: "text/javascript",
  mjs: "text/javascript",
  cjs: "text/javascript",
  jsx: "text/jsx",
  ts: "text/typescript",
  tsx: "text/typescript",
  py: "text/x-python",
  java: "text/x-java",
  c: "text/x-c",
  h: "text/x-c",
  cpp: "text/x-c++",
  hpp: "text/x-c++",
  cc: "text/x-c++",
  go: "text/x-go",
  rs: "text/x-rust",
  rb: "text/x-ruby",
  php: "application/x-php",
  sh: "application/x-sh",
  bash: "application/x-sh",
  zsh: "application/x-sh",
  css: "text/css",
  less: "text/x-less",
  scss: "text/x-scss",
  sass: "text/x-sass",
  vue: "text/x-vue",
  sql: "application/x-sql",
  r: "text/x-r",
  lua: "text/x-lua",
  dart: "text/x-dart",
  kt: "text/x-kotlin",
  swift: "text/x-swift",
  scala: "text/x-scala",
  proto: "text/x-proto",
  graphql: "application/graphql",
  gql: "application/graphql",

  // 图片
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  tiff: "image/tiff",
  tif: "image/tiff",

  // 文档
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  rtf: "application/rtf",
  epub: "application/epub+zip",

  // 媒体
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  avi: "video/x-msvideo",
  mov: "video/quicktime",
  mkv: "video/x-matroska",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  flac: "audio/flac",
  aac: "audio/aac",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  m4a: "audio/mp4",

  // 三维 / 科学
  obj: "model/obj",
  stl: "model/stl",
  gltf: "model/gltf+json",
  glb: "model/gltf-binary",
  vtk: "application/x-vtk",

  // 压缩
  zip: "application/zip",
  gz: "application/gzip",
  tar: "application/x-tar",
  "7z": "application/x-7z-compressed",
  rar: "application/x-rar",
};

// ─────────────────────────────────────────────────────────────────────────────
// MIME → 分类判断
// ─────────────────────────────────────────────────────────────────────────────

const IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
  "image/x-icon",
  "image/tiff",
]);

const PDF_MIMES = new Set(["application/pdf"]);

const OFFICE_DOC_MIMES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/rtf",
]);

const OFFICE_OOXML_MIMES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/x-msvideo",
  "video/quicktime",
  "video/x-matroska",
]);

const AUDIO_MIMES = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/flac",
  "audio/aac",
  "audio/ogg",
  "audio/mp4",
]);

const CSV_MIMES = new Set(["text/csv", "text/tab-separated-values"]);

const JSON_MIMES = new Set(["application/json", "application/json5"]);

const CODE_MIMES = new Set([
  "text/javascript",
  "text/typescript",
  "text/jsx",
  "text/x-python",
  "text/x-java",
  "text/x-c",
  "text/x-c++",
  "text/x-go",
  "text/x-rust",
  "text/x-ruby",
  "application/x-php",
  "application/x-sh",
  "text/css",
  "text/x-vue",
  "application/x-sql",
  "text/x-r",
  "text/x-lua",
  "text/x-dart",
  "text/x-kotlin",
  "text/x-swift",
  "text/x-scala",
  "text/x-proto",
  "application/graphql",
]);

const TEXTUAL_MIMES = new Set([
  "text/plain",
  "text/markdown",
  "text/html",
  "text/csv",
  "text/tab-separated-values",
  "application/json",
  "application/xml",
  "application/x-yaml",
  "application/x-toml",
  "text/x-ini",
  ...CODE_MIMES,
]);

/** 不可信的占位 MIME —— 需要进一步探测 */
const AMBIGUOUS_MIMES = new Set([
  "application/octet-stream",
  "application/binary",
  "binary/octet-stream",
  "application/x-binary",
  "",
]);

// ─────────────────────────────────────────────────────────────────────────────
// 二进制嗅探
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 判断一段文本采样是否「看起来像二进制」。
 *
 * 启发式策略（参考 file(1) 与 VSCode 的 binary detection）：
 * 1. 包含 NUL 字节 (\x00) → 一定是二进制
 * 2. 前 8KB 内非可打印/非空白字符占比 > 30% → 二进制
 * 3. 包含大量 UTF-8 替换字符 (\uFFFD) → 二进制被强解为文本
 *
 * @param sample 文本采样（通常是前 8KB，用 TextDecoder 解码出的字符串）
 */
export function looksLikeBinaryString(sample: string): boolean {
  if (!sample) return false;
  // 1. NUL 字节
  if (sample.indexOf("\x00") >= 0) return true;

  const len = Math.min(sample.length, 8192);
  let nonPrintable = 0;
  let replacementChars = 0;
  for (let i = 0; i < len; i++) {
    const code = sample.charCodeAt(i);
    // 可打印 ASCII 范围 + 常见空白 + Latin-1 补充
    if (
      (code >= 0x20 && code <= 0x7e) ||
      code === 0x09 ||
      code === 0x0a ||
      code === 0x0d ||
      (code >= 0xa0 && code <= 0xff)
    ) {
      continue;
    }
    if (code === 0xfffd) {
      replacementChars++;
      continue;
    }
    nonPrintable++;
  }
  // 替换字符 > 5% 基本是二进制误读
  if (replacementChars / len > 0.05) return true;
  return nonPrintable / len > 0.3;
}

/**
 * 通过前几字节判断是否为 PDF。
 * PDF 魔数：%PDF-
 */
export function looksLikePdf(sample: string): boolean {
  return sample.startsWith("%PDF-");
}

/**
 * 通过前几字节判断是否为 ZIP 容器（OOXML / EPUB / JAR / APK 都是 ZIP）。
 * ZIP 本地文件头魔数：PK\x03\x04
 */
export function looksLikeZip(sample: string): boolean {
  return (
    sample.charCodeAt(0) === 0x50 &&
    sample.charCodeAt(1) === 0x4b &&
    (sample.charCodeAt(2) === 0x03 || sample.charCodeAt(2) === 0x05) &&
    (sample.charCodeAt(3) === 0x04 || sample.charCodeAt(3) === 0x06)
  );
}

/**
 * 判断是否为 OOXML（DOCX/XLSX/PPTX）。
 *
 * OOXML 本质是 ZIP，且内部一定含有 `[Content_Types].xml`。
 * 但这里只做快速魔数判定（避免每次都解压），精确分类交给扩展名。
 */
export function isOfficeOoxml(sample: string): boolean {
  return looksLikeZip(sample);
}

// ─────────────────────────────────────────────────────────────────────────────
// 核心：resolveEffectiveMime
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 从扩展名推断 MIME。
 */
export function mimeFromExtension(filename?: string): string | null {
  if (!filename) return null;
  const dot = filename.lastIndexOf(".");
  if (dot < 0 || dot === filename.length - 1) return null;
  const ext = filename.slice(dot + 1).toLowerCase();
  return EXT_TO_MIME[ext] ?? null;
}

/**
 * 从魔数推断 MIME（仅支持几种常见且对预览路由有影响的格式）。
 */
export function mimeFromMagic(sample: string): string | null {
  if (!sample) return null;
  if (looksLikePdf(sample)) return "application/pdf";
  if (looksLikeZip(sample)) {
    // OOXML 家族，无法仅靠魔数区分 docx/xlsx/pptx，返回一个通用 OOXML 占位
    // 由调用方结合扩展名进一步判定
    return "application/x-ooxml-zip";
  }
  // PNG / JPG / GIF / WebP 魔数
  if (sample.startsWith("\x89PNG\r\n\x1a\n")) return "image/png";
  if (sample.charCodeAt(0) === 0xff && sample.charCodeAt(1) === 0xd8) return "image/jpeg";
  if (sample.startsWith("GIF87a") || sample.startsWith("GIF89a")) return "image/gif";
  if (sample.startsWith("RIFF") && sample.slice(8, 12) === "WEBP") return "image/webp";
  if (sample.startsWith("<svg") || sample.startsWith("<?xml")) {
    // SVG 经常以 <?xml 开头，进一步看是否含 <svg
    if (sample.slice(0, 512).includes("<svg")) return "image/svg+xml";
    return "application/xml";
  }
  if (sample.startsWith("{")) return "application/json";
  if (sample.startsWith("<")) return "text/html";
  return null;
}

/**
 * 解析文件的真实 MIME 类型。
 *
 * 判定优先级：
 * 1. 声明的 MIME 不是占位符（非 octet-stream/空）→ 直接用
 * 2. 扩展名映射 → 用映射值
 * 3. 文本采样魔数 → 用魔数值
 * 4. 都判定不出 → 返回声明的 MIME（哪怕是占位符）或 text/plain
 *
 * @param filename 文件名（用于取扩展名）
 * @param declaredMime 上传方/后端给出的 MIME
 * @param sample 文本采样（前 8KB 解码后的字符串，可选）
 */
export function resolveEffectiveMime(
  filename?: string,
  declaredMime?: string,
  sample?: string,
): string {
  const declared = (declaredMime ?? "").trim().toLowerCase();

  // 1. 声明的 MIME 可信 → 直接用
  if (declared && !AMBIGUOUS_MIMES.has(declared)) {
    return declared;
  }

  // 2. 扩展名
  const fromExt = mimeFromExtension(filename);
  if (fromExt) {
    // 对于 OOXML 扩展名，如果采样显示是 ZIP，可信
    if (sample && OFFICE_OOXML_MIMES.has(fromExt) && !looksLikeZip(sample)) {
      // 扩展名说是 docx 但内容不是 zip → 可能是误命名，继续探测
    } else {
      return fromExt;
    }
  }

  // 3. 魔数
  if (sample) {
    const fromMagic = mimeFromMagic(sample);
    if (fromMagic && fromMagic !== "application/x-ooxml-zip") {
      return fromMagic;
    }
    // 二进制嗅探：如果采样看起来是二进制，但 declared 是 text/plain → 修正
    if (looksLikeBinaryString(sample) && (declared === "text/plain" || !declared)) {
      return "application/octet-stream";
    }
  }

  // 4. 兜底
  return declared || "text/plain";
}

// ─────────────────────────────────────────────────────────────────────────────
// 分类判断便捷函数
// ─────────────────────────────────────────────────────────────────────────────

export function isImageMime(mime: string): boolean {
  return IMAGE_MIMES.has(mime);
}

export function isPdfMime(mime: string): boolean {
  return PDF_MIMES.has(mime);
}

export function isOfficeDocMime(mime: string): boolean {
  return OFFICE_DOC_MIMES.has(mime);
}

export function isOfficeOoxmlMime(mime: string): boolean {
  return OFFICE_OOXML_MIMES.has(mime);
}

/** 判断 MIME 是否为 DOCX */
export function isDocxMime(mime: string): boolean {
  return (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

/** 判断 MIME 是否为 XLSX */
export function isXlsxMime(mime: string): boolean {
  return (
    mime ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
}

/** 判断 MIME 是否为 PPTX */
export function isPptxMime(mime: string): boolean {
  return (
    mime ===
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );
}

export function isVideoMime(mime: string): boolean {
  return VIDEO_MIMES.has(mime);
}

export function isAudioMime(mime: string): boolean {
  return AUDIO_MIMES.has(mime);
}

export function isCsvMime(mime: string): boolean {
  return CSV_MIMES.has(mime);
}

export function isJsonMime(mime: string): boolean {
  return JSON_MIMES.has(mime);
}

export function isCodeMime(mime: string): boolean {
  return CODE_MIMES.has(mime);
}

export function isTextualMime(mime: string): boolean {
  return TEXTUAL_MIMES.has(mime);
}

export function isAmbiguousMime(mime: string): boolean {
  return AMBIGUOUS_MIMES.has(mime);
}

// ─────────────────────────────────────────────────────────────────────────────
// 辅助：从文件名取扩展名（小写、无点）
// ─────────────────────────────────────────────────────────────────────────────

export function getExtension(filename?: string): string | null {
  if (!filename) return null;
  const dot = filename.lastIndexOf(".");
  if (dot < 0 || dot === filename.length - 1) return null;
  return filename.slice(dot + 1).toLowerCase();
}
