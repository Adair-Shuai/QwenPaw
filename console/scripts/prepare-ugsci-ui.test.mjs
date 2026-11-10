import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { mock, test } from "node:test";
import { assertSupportedNode, prepareUgsciUi } from "./prepare-ugsci-ui.mjs";

test("shipped frontend lockfiles use registry packages accepted by npm 12", () => {
  for (const directory of [
    "plugins/bundle/ugsci/ui",
    "src/qwenpaw/plugins_bundle/ugsci/ui",
    "plugins/bundle/flowforge/ui",
    "src/qwenpaw/plugins_bundle/flowforge/ui",
  ]) {
    const lock = JSON.parse(
      readFileSync(
        new URL(`../../${directory}/package-lock.json`, import.meta.url),
        "utf8",
      ),
    );
    for (const [name, entry] of Object.entries(lock.packages)) {
      if (entry.resolved) {
        assert.equal(
          new URL(entry.resolved).origin,
          "https://registry.npmjs.org",
          name,
        );
        assert.ok(entry.integrity, `${name} must retain its integrity digest`);
      }
    }
  }
});

function fixture(t, installedNpm = "10.9.9") {
  const temporary = mkdtempSync(join(tmpdir(), "ugsci-prepare-"));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const repository = join(temporary, "repository");
  const frontend = join(repository, "plugins/bundle/ugsci/ui");
  const execPath = join(temporary, "node", "node.exe");
  const npm = join(dirname(execPath), "node_modules/npm/bin/npm-cli.js");
  mkdirSync(frontend, { recursive: true });
  mkdirSync(dirname(npm), { recursive: true });
  writeFileSync(npm, "");
  writeFileSync(join(repository, ".nvmrc"), "22.23.4\n");
  writeFileSync(join(frontend, "package-lock.json"), "{}");
  writeFileSync(
    join(frontend, "package.json"),
    JSON.stringify({ packageManager: "npm@12.2.2" }),
  );
  const spawn = mock.fn((_command, args) =>
    args[1] === "--version"
      ? { status: 0, stdout: `${installedNpm}\n` }
      : { status: 0 },
  );
  const log = mock.fn();
  const options = { repository, execPath, nodeVersion: "22.23.4", spawn, log };
  return { temporary, frontend, npm, spawn, log, options };
}

test("older host npm uses the exact pinned npm with strict dependency installation", (t) => {
  const { frontend, npm, spawn, options } = fixture(t);
  assert.equal(prepareUgsciUi(options), "installed");
  assert.equal(spawn.mock.callCount(), 2);
  const [command, args, childOptions] = spawn.mock.calls[1].arguments;
  assert.equal(command, options.execPath);
  assert.deepEqual(args, [
    npm,
    "exec",
    "--yes",
    "--package=npm@12.2.2",
    "--",
    "npm",
    "ci",
    "--engine-strict",
    "--no-audit",
    "--no-fund",
  ]);
  assert.equal(childOptions.cwd, frontend);
  assert.equal(childOptions.stdio, "inherit");
  const pathKey = Object.keys(childOptions.env).find(
    (key) => key.toLowerCase() === "path",
  );
  assert.equal(
    childOptions.env[pathKey].split(delimiter)[0],
    dirname(options.execPath),
  );
});

test("the matching host npm installs directly without npm exec", (t) => {
  const { npm, spawn, options } = fixture(t, "12.2.2");
  prepareUgsciUi(options);
  assert.deepEqual(spawn.mock.calls[1].arguments[1], [
    npm,
    "ci",
    "--engine-strict",
    "--no-audit",
    "--no-fund",
  ]);
});

test("clean checkouts install the distributed FlowForge editor's locked dependencies", (t) => {
  const { spawn, options } = fixture(t);
  const flowforge = join(
    options.repository,
    "src/qwenpaw/plugins_bundle/flowforge/ui",
  );
  mkdirSync(flowforge, { recursive: true });
  writeFileSync(join(flowforge, "package-lock.json"), "{}");
  assert.equal(prepareUgsciUi(options), "installed");
  assert.equal(spawn.mock.callCount(), 3);
  const [, args, childOptions] = spawn.mock.calls[2].arguments;
  assert.equal(childOptions.cwd, flowforge);
  assert.deepEqual(args, [
    ...spawn.mock.calls[1].arguments[1],
    "--ignore-scripts",
  ]);

  spawn.mock.mockImplementationOnce(() => ({ status: 19 }), 5);
  assert.throws(
    () => prepareUgsciUi(options),
    (error) => error.exitCode === 19,
  );
});

test("unsupported Node fails before spawning with an actionable repository version", (t) => {
  const { spawn, options } = fixture(t);
  assert.throws(
    () => prepareUgsciUi({ ...options, nodeVersion: "24.13.1" }),
    /npm 12\.2\.2.*Node 24\.13\.1.*\.nvmrc.*22\.23\.4.*24\.15\.0/,
  );
  assert.equal(spawn.mock.callCount(), 0);
});

test("Node support follows the npm 12 published engine boundaries", (t) => {
  const { options } = fixture(t);
  for (const version of [
    "22.22.2",
    "22.23.4",
    "24.15.0",
    "24.16.0",
    "26.0.0",
    "27.0.0",
  ]) {
    assert.doesNotThrow(() =>
      assertSupportedNode(version, "12.2.2", options.repository),
    );
  }
  for (const version of [
    "22.22.1",
    "22.21.9",
    "23.0.0",
    "24.14.9",
    "25.0.0",
    "26.0.0-rc.1",
  ]) {
    assert.throws(
      () => assertSupportedNode(version, "12.2.2", options.repository),
      /does not support Node/,
    );
  }
});

test("linked development dependencies are preserved without any npm execution", (t) => {
  const { temporary, frontend, spawn, log, options } = fixture(t);
  const linkedModules = join(temporary, "linked-modules");
  mkdirSync(linkedModules);
  symlinkSync(linkedModules, join(frontend, "node_modules"), "junction");
  assert.equal(
    prepareUgsciUi({ ...options, nodeVersion: "24.13.1" }),
    "linked",
  );
  assert.equal(spawn.mock.callCount(), 0);
  assert.match(log.mock.calls[0].arguments[0], /Preserving the linked/);
});

test("a frontend symlink outside the repository is rejected", (t) => {
  const { temporary, frontend, spawn, options } = fixture(t);
  rmSync(frontend, { recursive: true });
  const outside = join(temporary, "outside");
  mkdirSync(outside);
  writeFileSync(join(outside, "package-lock.json"), "{}");
  symlinkSync(outside, frontend, "junction");
  assert.throws(() => prepareUgsciUi(options), /must be inside the repository/);
  assert.equal(spawn.mock.callCount(), 0);
});

test("an unpinned package manager is rejected without invoking a shell", (t) => {
  const { frontend, spawn, options } = fixture(t);
  writeFileSync(
    join(frontend, "package.json"),
    JSON.stringify({ packageManager: "npm@latest" }),
  );
  assert.throws(
    () => prepareUgsciUi(options),
    /must pin an exact supported npm 12 version/,
  );
  assert.equal(spawn.mock.callCount(), 0);
});

test("an install failure retains its exit code and does not retry with weaker options", (t) => {
  const { spawn, options } = fixture(t);
  spawn.mock.mockImplementationOnce(() => ({ status: 17 }), 1);
  assert.throws(
    () => prepareUgsciUi(options),
    (error) => error.exitCode === 17,
  );
  assert.equal(spawn.mock.callCount(), 2);
});

test("an npm version probe failure prevents installation", (t) => {
  const { spawn, options } = fixture(t);
  spawn.mock.mockImplementationOnce(() => ({ status: 3 }), 0);
  assert.throws(
    () => prepareUgsciUi(options),
    /Reading the installed npm version failed/,
  );
  assert.equal(spawn.mock.callCount(), 1);
});
