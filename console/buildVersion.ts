import fs from "fs";
import path from "path";

const VERSION_PATTERN = /__version__\s*=\s*["']([^"']+)["']/;

/** Read the canonical Python package version for frontend build-time display. */
export function readQwenPawVersion(repositoryRoot: string): string {
  const versionFile = path.resolve(
    repositoryRoot,
    "src/qwenpaw/__version__.py",
  );
  const source = fs.readFileSync(versionFile, "utf8");
  const version = source.match(VERSION_PATTERN)?.[1]?.trim();
  if (!version) {
    throw new Error(`Unable to read QwenPaw version from ${versionFile}`);
  }
  return version;
}
