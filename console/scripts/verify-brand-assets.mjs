import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRoot = fileURLToPath(new URL("../../", import.meta.url));
const prefixes = {
  console: ["console/public/"],
  native: ["console/src-tauri/icons/", "scripts/pack/assets/"],
  website: ["website/public/"],
  chrome: ["plugins/bundle/chrome/assets/extensions/chrome/icons/"],
};

export function verifyBrandAssets({
  root = defaultRoot,
  scope = "all",
  dist,
} = {}) {
  if (scope !== "all" && !prefixes[scope]) {
    throw new Error(`Unknown brand asset scope ${scope}`);
  }
  if (dist && !["console", "website"].includes(scope)) {
    throw new Error(
      "Built asset verification requires console or website scope",
    );
  }
  const manifest = JSON.parse(
    readFileSync(path.join(root, "console/brand-assets.json"), "utf8"),
  );
  const errors = [];
  let count = 0;
  for (const [name, expected] of Object.entries(manifest)) {
    if (
      scope !== "all" &&
      !prefixes[scope].some((prefix) => name.startsWith(prefix))
    ) {
      continue;
    }
    if (path.isAbsolute(name) || name.split("/").includes("..")) {
      throw new Error(`Unsafe brand asset path ${name}`);
    }
    count++;
    const file = dist
      ? path.resolve(root, dist, name.slice(`${scope}/public/`.length))
      : path.join(root, name);
    try {
      const actual = createHash("sha256")
        .update(readFileSync(file))
        .digest("hex");
      if (actual !== expected) errors.push(`Stale brand asset ${file}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      errors.push(`Missing brand asset ${file}`);
    }
  }
  if (!count) throw new Error(`No brand assets recorded for ${scope}`);
  if (["all", "console", "website"].includes(scope)) {
    const templates = scope === "all" ? ["console", "website"] : [scope];
    for (const template of templates) {
      const pages = dist
        ? [path.resolve(root, dist, "index.html")]
        : template === "console"
        ? [
            path.join(root, "console/index.html"),
            path.join(root, "console/tauri.html"),
          ]
        : [path.join(root, "website/index.html")];
      const favicon =
        template === "console"
          ? "/ugsci-mono/brand/web/favicon.svg"
          : "/qwenpaw-symbol.svg";
      for (const page of pages) {
        const html = readFileSync(page, "utf8");
        if (!html.includes(`href="${favicon}"`)) {
          errors.push(`Stale favicon reference ${page}`);
        }
      }
    }
  }
  if (errors.length) {
    throw new Error(
      `${errors.join(
        "\n",
      )}\nRegenerate with python scripts/pack/generate_brand_assets.py and rebuild.`,
    );
  }
  return count;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2);
  const scope = args.includes("--scope")
    ? args[args.indexOf("--scope") + 1]
    : "all";
  const dist = args.includes("--dist")
    ? args[args.indexOf("--dist") + 1]
    : undefined;
  console.log(
    `Verified ${verifyBrandAssets({ scope, dist })} brand assets (${scope}).`,
  );
}
