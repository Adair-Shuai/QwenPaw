import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sharedPackages = [
  "react",
  "react-dom",
  "three",
  "@types/react",
  "@types/react-dom",
  "@types/three",
  "typescript",
  "vite",
];
const runtimePackages = ["react", "react-dom", "three"];
const consumers = {
  "react-dom": ["react"],
  "@react-three/fiber": ["react", "three"],
  "@react-three/drei": ["react", "three"],
  "@equinor/videx-3d": ["react", "three"],
  "three-stdlib": ["three"],
  "stats-gl": ["three"],
};
const exactVersion = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const readJson = (filename) => JSON.parse(readFileSync(filename, "utf8"));
const isPackage = (location, name) =>
  location === `node_modules/${name}` ||
  location.endsWith(`/node_modules/${name}`);

function findHostRoot(uiDir) {
  for (let directory = uiDir; ; directory = path.dirname(directory)) {
    if (existsSync(path.join(directory, "console", "package.json"))) {
      return directory;
    }
    if (path.dirname(directory) === directory) return undefined;
  }
}

/** Verify the installed build inputs, including physical runtime identity. */
export function verifyDependencies(uiDir) {
  const packageFile = path.join(uiDir, "package.json");
  const lockFile = path.join(uiDir, "package-lock.json");
  const manifest = readJson(packageFile);
  const lock = readJson(lockFile);
  const packages = lock.packages;
  if (!packages?.[""]) {
    throw new Error(`${lockFile}: expected an npm lockfile with a packages map`);
  }
  const errors = [];
  const versions = new Map();
  const uiRequire = createRequire(packageFile);
  const runtimeEntries = new Map();

  for (const name of sharedPackages) {
    const isReact = name === "react" || name === "react-dom";
    const section = isReact
      ? "devDependencies"
      : manifest.dependencies?.[name] !== undefined
        ? "dependencies"
        : "devDependencies";
    const version = manifest[section]?.[name];
    if (typeof version !== "string" || !exactVersion.test(version)) {
      errors.push(`${packageFile}: ${section}.${name} must be an exact version (found ${JSON.stringify(version)})`);
      continue;
    }
    versions.set(name, version);
    if (isReact && manifest.peerDependencies?.[name] !== "^18.3.1") {
      errors.push(`${packageFile}: peerDependencies.${name} must be ^18.3.1`);
    }
    if (isReact && manifest.dependencies?.[name] !== undefined) {
      errors.push(`${packageFile}: ${name} must be a development dependency and a peer, not a bundled dependency`);
    }
    if (packages[""][section]?.[name] !== version) {
      errors.push(`${lockFile}: root ${section}.${name} does not match ${version}`);
    }
    if (isReact && packages[""].peerDependencies?.[name] !== manifest.peerDependencies?.[name]) {
      errors.push(`${lockFile}: root peerDependencies.${name} does not match ${packageFile}`);
    }
    const location = `node_modules/${name}`;
    if (packages[location]?.version !== version) {
      errors.push(`${lockFile}: ${location} has version ${JSON.stringify(packages[location]?.version)}, expected ${version}`);
    }
    const installedFile = path.join(uiDir, location, "package.json");
    try {
      const installed = readJson(installedFile);
      if (installed.name !== name || installed.version !== version) {
        errors.push(`${installedFile}: installed ${installed.name}@${installed.version}, expected ${name}@${version}`);
      }
    } catch (error) {
      errors.push(`${installedFile}: cannot read installed ${name}: ${error.message}`);
    }
  }

  for (const name of runtimePackages) {
    for (const [location, metadata] of Object.entries(packages)) {
      if (isPackage(location, name) && metadata.version !== versions.get(name)) {
        errors.push(`${lockFile}: ${location} introduces ${name}@${metadata.version}; expected only ${versions.get(name)}`);
      }
    }
    try {
      runtimeEntries.set(name, realpathSync(uiRequire.resolve(name)));
    } catch (error) {
      errors.push(`${packageFile}: cannot resolve ${name}: ${error.message}`);
    }
  }

  // Resolve from actual package directories: package.json exports are often
  // intentionally hidden, and VidEx only exposes an ESM entry point.
  for (const [consumer, dependencies] of Object.entries(consumers)) {
    const locations = Object.keys(packages).filter((location) => isPackage(location, consumer));
    if (locations.length === 0) {
      errors.push(`${lockFile}: missing runtime consumer ${consumer}`);
    }
    for (const location of locations) {
      const installedFile = path.join(uiDir, location, "package.json");
      try {
        const consumerRequire = createRequire(realpathSync(installedFile));
        for (const dependency of dependencies) {
          const resolved = realpathSync(consumerRequire.resolve(dependency));
          const expected = runtimeEntries.get(dependency);
          if (expected && resolved !== expected) {
            errors.push(`${location}: ${dependency} resolves to a second runtime at ${resolved}; expected ${expected}`);
          }
        }
      } catch (error) {
        errors.push(`${installedFile}: cannot verify runtime identity: ${error.message}`);
      }
    }
  }

  const hostRoot = findHostRoot(uiDir);
  if (hostRoot) {
    const hostLockFile = path.join(hostRoot, "console", "package-lock.json");
    try {
      const hostLock = readJson(hostLockFile);
      for (const [name, version] of versions) {
        const hostVersion = hostLock.packages?.[`node_modules/${name}`]?.version;
        if (hostVersion !== version) {
          errors.push(`${hostLockFile}: ${name}@${hostVersion} differs from plugin ${version}`);
        }
      }
    } catch (error) {
      errors.push(`${hostLockFile}: cannot compare host dependencies: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`UGSci dependency verification failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  }
  return { versions: Object.fromEntries(versions), hostCompared: Boolean(hostRoot) };
}

const scriptFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === scriptFile) {
  try {
    const result = verifyDependencies(path.resolve(path.dirname(scriptFile), ".."));
    console.log(`UGSci dependency verification passed (${result.hostCompared ? "host versions matched" : "standalone plugin; host comparison skipped"}).`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
