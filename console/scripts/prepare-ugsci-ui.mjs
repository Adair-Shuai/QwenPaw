import { existsSync, lstatSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// Console regression suites import the real Viewer sources and its Three.js
// runtime. Install that package's own locked dependencies on clean checkouts.
const repository = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const frontend = join(repository, "plugins/bundle/ugsci/ui");
if (existsSync(join(frontend, "package-lock.json"))) {
  const location = relative(realpathSync(repository), realpathSync(frontend));
  if (location.startsWith("..") || isAbsolute(location)) {
    throw new Error("UGSci frontend must be inside the repository");
  }
  const modules = join(frontend, "node_modules");
  if (existsSync(modules) && lstatSync(modules).isSymbolicLink()) {
    console.log("Preserving the linked UGSci development dependencies");
  } else {
    const nodeDirectory = dirname(process.execPath);
    const npm = [
      join(nodeDirectory, "node_modules/npm/bin/npm-cli.js"),
      resolve(nodeDirectory, "../lib/node_modules/npm/bin/npm-cli.js"),
    ].find(existsSync);
    if (!npm) throw new Error("Cannot locate npm beside the Node.js runtime");
    const result = spawnSync(
      process.execPath,
      [npm, "ci", "--no-audit", "--no-fund"],
      { cwd: frontend, stdio: "inherit" },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
