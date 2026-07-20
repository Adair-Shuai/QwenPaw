#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ensure plugin frontend bundles exist before starting the dev server.

Scans ``plugins/bundle/*/ui/`` for plugins that declare a frontend entry
in ``plugin.json``.  If the expected ``dist/index.js`` is missing, the
script automatically runs ``npm install && npm run build`` inside that
plugin's ``ui/`` directory and syncs the result to:

  - ``src/qwenpaw/plugins_bundle/<plugin>/ui/dist/``  (PyInstaller mirror)
  - ``~/.qwenpaw/plugins/<plugin>/ui/dist/``           (runtime — what the
    backend actually serves via ``/api/frontend_plugin/...``)

This script is idempotent: plugins whose ``dist/index.js`` already exists
are skipped, so repeated ``pnpm dev`` invocations pay zero overhead.

Usage:
    python scripts/dev_ensure_plugin_uis.py           # build only missing
    python scripts/dev_ensure_plugin_uis.py --force   # rebuild all
    python scripts/dev_ensure_plugin_uis.py --check   # exit 1 if missing

Intended to be wired as a ``predev`` npm script in ``console/package.json``
so that ``pnpm dev`` automatically builds missing plugin bundles before
starting Vite.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

# ── Helpers ────────────────────────────────────────────────────────────────


def _repo_root() -> Path:
    """Return the repository root (parent of scripts/)."""
    return Path(__file__).resolve().parent.parent


def _get_plugins_dir() -> Path:
    """Return the user's runtime plugins directory."""
    return Path.home() / ".qwenpaw" / "plugins"


def _read_manifest(plugin_dir: Path) -> dict | None:
    """Read and parse plugin.json from a plugin directory."""
    manifest_path = plugin_dir / "plugin.json"
    if not manifest_path.exists():
        return None
    try:
        return json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception:
        return None


def _find_npm() -> str | None:
    """Return the path to npm, or None."""
    return shutil.which("npm")


def _build_plugin(ui_dir: Path, plugin_id: str) -> bool:
    """Run npm install + npm run build inside a plugin's ui/ directory.

    Returns True on success, False on failure.
    """
    npm = _find_npm()
    if npm is None:
        print(
            f"  [SKIP] {plugin_id}: npm not found on PATH. "
            "Install Node.js to build plugin UIs.",
            file=sys.stderr,
        )
        return False

    print(f"  → {plugin_id}: installing dependencies...")
    try:
        result = subprocess.run(
            [npm, "install"],
            cwd=str(ui_dir),
            capture_output=True,
            text=True,
            timeout=120,
            shell=os.name == "nt",  # noqa: S602
        )
    except subprocess.TimeoutExpired:
        print(f"  [FAIL] {plugin_id}: npm install timed out", file=sys.stderr)
        return False

    if result.returncode != 0:
        print(
            f"  [FAIL] {plugin_id}: npm install failed",
            file=sys.stderr,
        )
        if result.stderr:
            # Print last 5 lines of stderr for debugging
            for line in result.stderr.strip().splitlines()[-5:]:
                print(f"        {line}", file=sys.stderr)
        return False

    print(f"  → {plugin_id}: building frontend bundle...")
    try:
        result = subprocess.run(
            [npm, "run", "build"],
            cwd=str(ui_dir),
            capture_output=True,
            text=True,
            timeout=120,
            shell=os.name == "nt",  # noqa: S602
        )
    except subprocess.TimeoutExpired:
        print(f"  [FAIL] {plugin_id}: npm run build timed out", file=sys.stderr)
        return False

    if result.returncode != 0:
        print(
            f"  [FAIL] {plugin_id}: npm run build failed",
            file=sys.stderr,
        )
        if result.stderr:
            for line in result.stderr.strip().splitlines()[-5:]:
                print(f"        {line}", file=sys.stderr)
        return False

    return True


def _sync_dist(
    plugin_dir: Path,
    frontend_entry: str,
    repo: Path,
    plugin_id: str,
) -> None:
    """Sync the built dist/ to src/qwenpaw/plugins_bundle/ and runtime dir.

    Args:
        plugin_dir: Path to plugins/bundle/<plugin>/
        frontend_entry: Relative path like "ui/dist/index.js"
        repo: Repository root
        plugin_id: Plugin ID from manifest
    """
    dist_file = plugin_dir / frontend_entry
    if not dist_file.is_file():
        return

    # 1. Sync to src/qwenpaw/plugins_bundle/<plugin>/<frontend_entry>
    src_mirror = (
        repo
        / "src"
        / "qwenpaw"
        / "plugins_bundle"
        / plugin_dir.name
    )
    if src_mirror.is_dir():
        mirror_dist = src_mirror / frontend_entry
        mirror_dist.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(dist_file, mirror_dist)
        # Also copy any sibling files (e.g. style.css)
        for sibling in dist_file.parent.iterdir():
            if sibling.name == dist_file.name:
                continue
            if sibling.is_file():
                shutil.copy2(
                    sibling,
                    mirror_dist.parent / sibling.name,
                )

    # 2. Sync to ~/.qwenpaw/plugins/<plugin>/<frontend_entry>
    runtime_dir = _get_plugins_dir() / plugin_id
    if runtime_dir.is_dir():
        runtime_dist = runtime_dir / frontend_entry
        runtime_dist.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(dist_file, runtime_dist)
        for sibling in dist_file.parent.iterdir():
            if sibling.name == dist_file.name:
                continue
            if sibling.is_file():
                shutil.copy2(
                    sibling,
                    runtime_dist.parent / sibling.name,
                )


# ── Main ───────────────────────────────────────────────────────────────────


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(
        description="Ensure plugin frontend bundles exist for dev mode.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Rebuild all plugin UIs, even if dist/ already exists.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Only check; exit 1 if any plugin dist is missing. "
        "Do not build anything.",
    )
    args = parser.parse_args()

    repo = _repo_root()
    bundle_dir = repo / "plugins" / "bundle"

    if not bundle_dir.is_dir():
        print("[dev_ensure_plugin_uis] No plugins/bundle/ directory found.")
        return 0

    # Collect all plugins with a frontend entry
    plugins_to_check: list[tuple[Path, str, str]] = []  # (dir, id, entry)
    for plugin_dir in sorted(bundle_dir.iterdir()):
        if not plugin_dir.is_dir():
            continue
        manifest = _read_manifest(plugin_dir)
        if manifest is None:
            continue
        frontend_entry = manifest.get("entry", {}).get("frontend")
        if not frontend_entry:
            continue
        plugin_id = manifest.get("id", plugin_dir.name)
        plugins_to_check.append((plugin_dir, plugin_id, frontend_entry))

    if not plugins_to_check:
        print("[dev_ensure_plugin_uis] No plugins with frontend entries found.")
        return 0

    missing: list[tuple[Path, str, str]] = []
    up_to_date: list[str] = []

    for plugin_dir, plugin_id, entry in plugins_to_check:
        dist_file = plugin_dir / entry
        if not dist_file.is_file() or args.force:
            missing.append((plugin_dir, plugin_id, entry))
        else:
            up_to_date.append(plugin_id)

    if up_to_date and not args.force:
        print(
            f"[dev_ensure_plugin_uis] {len(up_to_date)} plugin(s) already "
            f"built: {', '.join(up_to_date)}",
        )

    if args.check:
        if missing:
            print(
                f"[dev_ensure_plugin_uis] {len(missing)} plugin(s) missing "
                f"frontend bundles:",
                file=sys.stderr,
            )
            for _, pid, entry in missing:
                print(f"  - {pid}: {entry}", file=sys.stderr)
            return 1
        print("[dev_ensure_plugin_uis] All plugin frontend bundles present.")
        return 0

    if not missing:
        print("[dev_ensure_plugin_uis] All plugin frontend bundles present.")
        return 0

    print(
        f"[dev_ensure_plugin_uis] {len(missing)} plugin(s) need building...",
    )

    built: list[str] = []
    failed: list[str] = []

    for plugin_dir, plugin_id, entry in missing:
        ui_dir = plugin_dir / "ui"
        if not ui_dir.is_dir():
            print(f"  [SKIP] {plugin_id}: no ui/ directory")
            continue

        if _build_plugin(ui_dir, plugin_id):
            built.append(plugin_id)
            # Verify the build produced the expected file
            dist_file = plugin_dir / entry
            if dist_file.is_file():
                size_kb = dist_file.stat().st_size / 1024
                print(
                    f"  [OK] {plugin_id}: built {entry} "
                    f"({size_kb:.1f} KB)",
                )
                # Sync to other locations
                _sync_dist(plugin_dir, entry, repo, plugin_id)
            else:
                print(
                    f"  [WARN] {plugin_id}: build succeeded but "
                    f"{entry} not found",
                    file=sys.stderr,
                )
        else:
            failed.append(plugin_id)

    print()
    if built:
        print(
            f"[dev_ensure_plugin_uis] Built: {', '.join(built)}",
        )
    if failed:
        print(
            f"[dev_ensure_plugin_uis] Failed: {', '.join(failed)}",
            file=sys.stderr,
        )
        print(
            "  You can still start the dev server, but these plugins' "
            "UIs will not load.",
            file=sys.stderr,
        )

    return 0  # Don't block dev server start even if some builds fail


if __name__ == "__main__":
    sys.exit(main())
