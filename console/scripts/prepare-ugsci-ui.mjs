import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import {
  delimiter,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// Console regression suites import the real Viewer sources and its Three.js
// runtime. Install that package's own locked dependencies on clean checkouts.
const scriptPath = fileURLToPath(import.meta.url);
const defaultRepository = resolve(dirname(scriptPath), "../..");

function checkResult(result, description) {
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const error = new Error(
      `${description} failed (exit ${result.status ?? 1})`,
    );
    error.exitCode = result.status ?? 1;
    throw error;
  }
}

export function assertSupportedNode(nodeVersion, npmVersion, repository) {
  // npm 12's published engine range: ^22.22.2 || ^24.15.0 || >=26.0.0.
  // Keep this explicit instead of bypassing its engine check on older runtimes.
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(nodeVersion);
  const [major, minor, patch] = match ? match.slice(1).map(Number) : [];
  const supported =
    (major === 22 && (minor > 22 || (minor === 22 && patch >= 2))) ||
    (major === 24 && minor >= 15) ||
    major >= 26;
  if (!supported) {
    const versionFile = join(repository, ".nvmrc");
    const recommended = existsSync(versionFile)
      ? readFileSync(versionFile, "utf8").trim()
      : "22.23.4";
    throw new Error(
      `UGSci requires npm ${npmVersion}, which does not support Node ${nodeVersion}. ` +
        `Use the repository .nvmrc version (Node ${recommended}), Node 24.15.0 or later within 24.x, or Node 26+.`,
    );
  }
}

export function prepareUgsciUi({
  repository = defaultRepository,
  execPath = process.execPath,
  nodeVersion = process.versions.node,
  spawn = spawnSync,
  log = console.log,
} = {}) {
  const frontend = join(repository, "plugins/bundle/ugsci/ui");
  if (!existsSync(join(frontend, "package-lock.json"))) return "missing";
  const location = relative(realpathSync(repository), realpathSync(frontend));
  if (location.startsWith("..") || isAbsolute(location)) {
    throw new Error("UGSci frontend must be inside the repository");
  }
  const modules = join(frontend, "node_modules");
  if (existsSync(modules) && lstatSync(modules).isSymbolicLink()) {
    log("Preserving the linked UGSci development dependencies");
    return "linked";
  }

  const { packageManager } = JSON.parse(
    readFileSync(join(frontend, "package.json"), "utf8"),
  );
  const pinned = /^npm@(12\.\d+\.\d+)$/.exec(packageManager ?? "");
  if (!pinned) {
    throw new Error(
      "UGSci packageManager must pin an exact supported npm 12 version",
    );
  }
  const npmVersion = pinned[1];
  assertSupportedNode(nodeVersion, npmVersion, repository);

  const nodeDirectory = dirname(execPath);
  const npm = [
    join(nodeDirectory, "node_modules/npm/bin/npm-cli.js"),
    resolve(nodeDirectory, "../lib/node_modules/npm/bin/npm-cli.js"),
  ].find(existsSync);
  if (!npm) throw new Error("Cannot locate npm beside the Node.js runtime");

  // npm exec's command shims must use this same Node, including when a portable
  // runtime started this script. This only changes the child process environment.
  const env = { ...process.env };
  const pathKey =
    Object.keys(env).find((key) => key.toLowerCase() === "path") ?? "PATH";
  env[pathKey] = `${nodeDirectory}${delimiter}${env[pathKey] ?? ""}`;
  const options = { cwd: frontend, env };
  const version = spawn(execPath, [npm, "--version"], {
    ...options,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  checkResult(version, "Reading the installed npm version");
  const ci = ["ci", "--engine-strict", "--no-audit", "--no-fund"];
  const args =
    version.stdout.trim() === npmVersion
      ? [npm, ...ci]
      : [
          npm,
          "exec",
          "--yes",
          `--package=npm@${npmVersion}`,
          "--",
          "npm",
          ...ci,
        ];
  // npm exec keeps its exact-version tool in the npm cache; no global install
  // and no extra dependency in the shipped plugin are needed.
  const installed = spawn(execPath, args, { ...options, stdio: "inherit" });
  checkResult(installed, "Installing the UGSci frontend dependencies");
  return "installed";
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  try {
    prepareUgsciUi();
  } catch (error) {
    console.error(error.message);
    process.exitCode = error.exitCode ?? 1;
  }
}
