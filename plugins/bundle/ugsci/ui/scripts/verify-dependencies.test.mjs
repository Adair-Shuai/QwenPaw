import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { verifyDependencies } from "./verify-dependencies.mjs";

function writeJson(filename, value) {
  mkdirSync(path.dirname(filename), { recursive: true });
  writeFileSync(filename, JSON.stringify(value));
}

function installPackage(directory, name, version) {
  writeJson(path.join(directory, "package.json"), { name, version, main: "index.cjs" });
  writeFileSync(path.join(directory, "index.cjs"), "module.exports = {};\n");
}

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), "ugsci-dependencies-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const uiDir = path.join(root, "plugin", "ui");
  const manifest = {
    dependencies: { three: "0.200.1" },
    devDependencies: {
      react: "18.3.1",
      "react-dom": "18.3.1",
      "@types/react": "18.9.1",
      "@types/react-dom": "18.9.2",
      "@types/three": "0.200.3",
      typescript: "5.9.1",
      vite: "6.9.1",
    },
    peerDependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
  };
  const packages = { "": structuredClone(manifest) };
  const versions = { ...manifest.dependencies, ...manifest.devDependencies };
  for (const name of ["@react-three/fiber", "@react-three/drei", "@equinor/videx-3d", "three-stdlib", "stats-gl"]) {
    versions[name] = "1.2.3";
  }
  for (const [name, version] of Object.entries(versions)) {
    packages[`node_modules/${name}`] = { version };
    installPackage(path.join(uiDir, "node_modules", name), name, version);
  }
  const lock = { lockfileVersion: 3, packages };
  const packageFile = path.join(uiDir, "package.json");
  const lockFile = path.join(uiDir, "package-lock.json");
  writeJson(packageFile, manifest);
  writeJson(lockFile, lock);
  return { root, uiDir, manifest, lock, packageFile, lockFile };
}

test("accepts an independent plugin with one physical Three and React runtime", (t) => {
  const { uiDir } = fixture(t);
  assert.equal(verifyDependencies(uiDir).hostCompared, false);
});

test("compares host locked versions while allowing host version ranges", (t) => {
  const { root, uiDir, lock } = fixture(t);
  writeJson(path.join(root, "console", "package.json"), { dependencies: { three: "^0.200.0" } });
  const hostLockFile = path.join(root, "console", "package-lock.json");
  writeJson(hostLockFile, lock);
  assert.equal(verifyDependencies(uiDir).hostCompared, true);
  lock.packages["node_modules/three"].version = "0.201.0";
  writeJson(hostLockFile, lock);
  assert.throws(() => verifyDependencies(uiDir), /three@0\.201\.0 differs from plugin 0\.200\.1/);
});

test("rejects an installed version that drifted from the declaration and lock", (t) => {
  const { uiDir } = fixture(t);
  installPackage(path.join(uiDir, "node_modules", "three"), "three", "0.201.0");
  assert.throws(() => verifyDependencies(uiDir), /installed three@0\.201\.0, expected three@0\.200\.1/);
});

test("rejects a second locked runtime version at a nested package location", (t) => {
  const { uiDir, lock, lockFile } = fixture(t);
  lock.packages["node_modules/unrelated/node_modules/react"] = { version: "19.0.0" };
  writeJson(lockFile, lock);
  assert.throws(() => verifyDependencies(uiDir), /node_modules\/unrelated\/node_modules\/react introduces react@19\.0\.0/);
});

for (const [consumer, dependency, version] of [
  ["@react-three/fiber", "react", "18.3.1"],
  ["stats-gl", "three", "0.200.1"],
]) {
  test(`rejects a physically duplicated ${dependency} runtime even if its version and lock agree`, (t) => {
    const { uiDir, lock, lockFile } = fixture(t);
    const location = `node_modules/${consumer}/node_modules/${dependency}`;
    lock.packages[location] = { version };
    writeJson(lockFile, lock);
    installPackage(path.join(uiDir, location), dependency, version);
    assert.throws(() => verifyDependencies(uiDir), new RegExp(`${consumer}: ${dependency} resolves to a second runtime`));
  });
}

test("rejects a floating direct version even if the installed version matches the lock", (t) => {
  const { uiDir, manifest, packageFile } = fixture(t);
  manifest.dependencies.three = "^0.200.1";
  writeJson(packageFile, manifest);
  assert.throws(() => verifyDependencies(uiDir), /dependencies\.three must be an exact version/);
});

test("does not treat unrelated Zustand versions as duplicate runtimes", (t) => {
  const { uiDir, lock, lockFile } = fixture(t);
  lock.packages["node_modules/zustand"] = { version: "5.0.0" };
  lock.packages["node_modules/@react-three/fiber/node_modules/zustand"] = { version: "3.7.2" };
  lock.packages["node_modules/@react-three/drei/node_modules/zustand"] = { version: "4.5.0" };
  writeJson(lockFile, lock);
  assert.equal(verifyDependencies(uiDir).hostCompared, false);
});

test("requires the React 18 peer contract alongside the pinned development dependency", (t) => {
  const { uiDir, packageFile } = fixture(t);
  const manifest = JSON.parse(readFileSync(packageFile, "utf8"));
  manifest.peerDependencies.react = ">=18";
  writeJson(packageFile, manifest);
  assert.throws(() => verifyDependencies(uiDir), /peerDependencies\.react must be \^18\.3\.1/);
});
