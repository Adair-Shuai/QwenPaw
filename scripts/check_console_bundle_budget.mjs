#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const assetsDir = path.join(repoRoot, "console", "dist", "assets");

// Initial ratchet values are deliberately just above the current production
// build. Tighten them as large feature libraries move behind lazy boundaries.
const MAX_JS_CHUNK_BYTES = 9 * 1024 * 1024;
const MAX_TOTAL_JS_BYTES = 32 * 1024 * 1024;

if (!fs.existsSync(assetsDir)) {
  console.error(
    "[bundle-budget] console/dist/assets is missing; build the Console first.",
  );
  process.exit(1);
}

const jsFiles = fs
  .readdirSync(assetsDir)
  .filter((name) => name.endsWith(".js"))
  .map((name) => {
    const absolute = path.join(assetsDir, name);
    return { name, bytes: fs.statSync(absolute).size };
  });

const totalBytes = jsFiles.reduce((sum, file) => sum + file.bytes, 0);
const oversized = jsFiles.filter(
  (file) => file.bytes > MAX_JS_CHUNK_BYTES,
);

if (oversized.length > 0 || totalBytes > MAX_TOTAL_JS_BYTES) {
  console.error("[bundle-budget] production bundle exceeds its budget:");
  for (const file of oversized) {
    console.error(
      `  - ${file.name}: ${(file.bytes / 1024 / 1024).toFixed(2)} MiB`,
    );
  }
  console.error(
    `  total JS: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB ` +
      `(limit ${(MAX_TOTAL_JS_BYTES / 1024 / 1024).toFixed(0)} MiB)`,
  );
  process.exit(1);
}

const largest = [...jsFiles].sort((a, b) => b.bytes - a.bytes)[0];
console.log(
  `[bundle-budget] ${jsFiles.length} JS chunks, ` +
    `${(totalBytes / 1024 / 1024).toFixed(2)} MiB total, ` +
    `largest ${largest?.name ?? "n/a"} ` +
    `(${((largest?.bytes ?? 0) / 1024 / 1024).toFixed(2)} MiB)`,
);
