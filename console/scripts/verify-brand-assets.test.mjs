import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { verifyBrandAssets } from "./verify-brand-assets.mjs";

const repository = fileURLToPath(new URL("../../", import.meta.url));
const manifest = JSON.parse(
  readFileSync(path.join(repository, "console/brand-assets.json"), "utf8"),
);

test("keeps content verification before every shared plugin release pack step", () => {
  for (const [name, command] of [
    ["plugins-release.yml", "python scripts/pack/generate_plugin_metadata.py"],
    ["release-resume.yml", "python -m build"],
  ]) {
    const workflow = readFileSync(
      path.join(repository, ".github/workflows", name),
      "utf8",
    );
    const check = workflow.indexOf(
      "run: node console/scripts/verify-brand-assets.mjs",
    );
    const pack = workflow.indexOf(command);
    assert.ok(check >= 0 && check < pack, name);
  }
});

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), "ugsci-brand-test-"));
  t.after(() => {
    assert.equal(path.dirname(root), os.tmpdir());
    assert.ok(path.basename(root).startsWith("ugsci-brand-test-"));
    rmSync(root, { recursive: true, force: true });
  });
  for (const file of [
    ...Object.keys(manifest),
    "console/brand-assets.json",
    "console/index.html",
    "console/tauri.html",
    "website/index.html",
  ]) {
    const target = path.join(root, file);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(repository, file), target);
  }
  return root;
}

test("verifies actual shipped assets and rejects changed installer content", (t) => {
  const root = fixture(t);
  assert.equal(verifyBrandAssets({ root }), Object.keys(manifest).length);
  const icon = path.join(root, "scripts/pack/assets/icon.ico");
  const bytes = readFileSync(icon);
  bytes[bytes.length - 1] ^= 1;
  writeFileSync(icon, bytes);
  assert.throws(
    () => verifyBrandAssets({ root, scope: "native" }),
    /Stale brand asset/,
  );
});

test("rejects missing mobile and extension icons", (t) => {
  const root = fixture(t);
  rmSync(
    path.join(
      root,
      "console/src-tauri/icons/android/mipmap-hdpi/ic_launcher.png",
    ),
  );
  rmSync(
    path.join(
      root,
      "plugins/bundle/chrome/assets/extensions/chrome/icons/logo-16.png",
    ),
  );
  assert.throws(
    () => verifyBrandAssets({ root, scope: "native" }),
    /Missing brand asset/,
  );
  assert.throws(
    () => verifyBrandAssets({ root, scope: "chrome" }),
    /Missing brand asset/,
  );
  assert.ok(verifyBrandAssets({ root, scope: "console" }) > 0);
});

test("checks built public assets and catches the desktop favicon regression", (t) => {
  const root = fixture(t);
  const dist = "built";
  for (const file of Object.keys(manifest).filter((name) =>
    name.startsWith("console/public/"),
  )) {
    const target = path.join(root, dist, file.slice("console/public/".length));
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(root, file), target);
  }
  const page = path.join(root, dist, "index.html");
  copyFileSync(path.join(root, "console/tauri.html"), page);
  assert.ok(verifyBrandAssets({ root, scope: "console", dist }) > 0);
  writeFileSync(page, '<link rel="icon" href="/online.svg" />');
  assert.throws(
    () => verifyBrandAssets({ root, scope: "console", dist }),
    /Stale favicon reference/,
  );
  writeFileSync(
    path.join(root, "console/tauri.html"),
    '<link rel="icon" href="/online.svg" />',
  );
  assert.throws(
    () => verifyBrandAssets({ root, scope: "console" }),
    /Stale favicon reference/,
  );
});
