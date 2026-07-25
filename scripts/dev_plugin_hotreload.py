#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Plugin development hot-reload helper.

Creates a directory junction (Windows) / symlink (Unix) from the runtime
plugin directory to the source directory, so that edits to source files
are immediately visible at runtime without manual syncing.

Usage:
    # Link ugsci plugin source → runtime
    python scripts/dev_plugin_hotreload.py link ugsci

    # Unlink (restore normal copy-based sync)
    python scripts/dev_plugin_hotreload.py unlink ugsci

    # Hot-reload backend changes via API (no restart needed)
    python scripts/dev_plugin_hotreload.py reload ugsci

    # Show current link status
    python scripts/dev_plugin_hotreload.py status
"""
from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path
from urllib import request

# ─── Paths ──────────────────────────────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parent.parent

# Source directories for bundled plugins (in priority order)
BUNDLE_DIRS = [
    REPO_ROOT / "plugins" / "bundle",
    REPO_ROOT / "src" / "qwenpaw" / "plugins_bundle",
]

# Runtime plugins directory
RUNTIME_PLUGINS_DIR = Path.home() / ".qwenpaw" / "plugins"

# API base
API_BASE = "http://127.0.0.1:8088/api"


def get_plugin_source_dir(plugin_id: str) -> Path | None:
    """Find the source directory for a plugin in bundle dirs."""
    for bundle_dir in BUNDLE_DIRS:
        candidate = bundle_dir / plugin_id
        if candidate.is_dir() and (candidate / "plugin.json").exists():
            return candidate
    return None


def get_runtime_plugin_dir(plugin_id: str) -> Path:
    """Return the runtime directory path for a plugin."""
    return RUNTIME_PLUGINS_DIR / plugin_id


def is_junction_or_symlink(path: Path) -> bool:
    """Check if a path is a junction (Windows) or symlink (Unix)."""
    if not path.exists():
        return False
    if platform.system() == "Windows":
        # On Windows, junctions are detected via FILE_ATTRIBUTE_REPARSE_POINT
        import ctypes

        attrs = ctypes.windll.kernel32.GetFileAttributesW(str(path))
        return (
            attrs != -1 and (attrs & 0x400) != 0
        )  # FILE_ATTRIBUTE_REPARSE_POINT
    else:
        return path.is_symlink()


def read_plugin_version(plugin_dir: Path) -> str:
    """Read version from plugin.json."""
    manifest = plugin_dir / "plugin.json"
    if not manifest.exists():
        return "?"
    try:
        data = json.loads(manifest.read_text(encoding="utf-8"))
        return data.get("version", "?")
    except Exception:
        return "?"


# ─── Commands ───────────────────────────────────────────────────────────


def cmd_link(plugin_id: str) -> None:
    """Link runtime plugin dir → source dir via junction/symlink."""
    source = get_plugin_source_dir(plugin_id)
    if source is None:
        print(f"[ERROR] Plugin '{plugin_id}' not found in bundle dirs:")
        for d in BUNDLE_DIRS:
            print(f"  - {d}")
        sys.exit(1)

    target = get_runtime_plugin_dir(plugin_id)

    print(f"Linking: {target}")
    print(f"     →   {source}")

    # Backup version info
    src_version = read_plugin_version(source)

    # Remove existing runtime dir
    if target.exists():
        if is_junction_or_symlink(target):
            # Remove junction/symlink without deleting the target
            if platform.system() == "Windows":
                subprocess.run(
                    ["rmdir", str(target), "/Q"],
                    shell=True,
                    check=True,
                )
            else:
                target.unlink()
            print(f"  [OK] Removed existing link: {target}")
        else:
            # It's a real directory — back it up
            backup = target.with_suffix(".bak")
            if backup.exists():
                shutil.rmtree(backup, ignore_errors=True)
            shutil.move(str(target), str(backup))
            print(f"  [OK] Backed up existing dir → {backup}")

    # Create junction (Windows) or symlink (Unix)
    target.parent.mkdir(parents=True, exist_ok=True)

    if platform.system() == "Windows":
        # Use mklink /J for directory junction (no admin required)
        subprocess.run(
            ["cmd", "/c", "mklink", "/J", str(target), str(source)],
            check=True,
        )
    else:
        os.symlink(source, target, target_is_directory=True)

    print("\n[DONE] Junction created:")
    print(f"  {target} → {source}")
    print(f"  Plugin: {plugin_id} v{src_version}")
    print("\nNow edits to source files are immediately visible at runtime.")
    print("Restart the backend to load the linked plugin.")


def cmd_unlink(plugin_id: str) -> None:
    """Remove junction/symlink and restore normal copy-based sync."""
    target = get_runtime_plugin_dir(plugin_id)

    if not target.exists():
        print(f"[INFO] Runtime dir does not exist: {target}")
        return

    if not is_junction_or_symlink(target):
        print(
            f"[INFO] {target} is not a junction/symlink — nothing to unlink.",
        )
        return

    # Remove the junction/symlink
    if platform.system() == "Windows":
        subprocess.run(
            ["rmdir", str(target), "/Q"],
            shell=True,
            check=True,
        )
    else:
        target.unlink()

    print(f"[OK] Removed link: {target}")

    # Restore backup if exists
    backup = target.with_suffix(".bak")
    if backup.exists():
        shutil.move(str(backup), str(target))
        print(f"[OK] Restored backup → {target}")
    else:
        # Re-sync from source
        source = get_plugin_source_dir(plugin_id)
        if source:
            shutil.copytree(source, target)
            print(f"[OK] Re-synced from source → {target}")

    print("\nRun `qwenpaw plugin sync-bundled --force` to ensure clean state.")


def _get_auth_headers() -> dict[str, str]:
    """Return auth headers if a token file exists."""
    headers: dict[str, str] = {"Content-Type": "application/json"}
    token_file = Path.home() / ".qwenpaw" / "auth_token"
    if token_file.exists():
        token = token_file.read_text(encoding="utf-8").strip()
        headers["Authorization"] = f"Bearer {token}"
    return headers


def cmd_reload(plugin_id: str) -> None:
    """Hot-reload a plugin via the API (no restart needed).

    Uses the /reload endpoint which unloads and re-loads from the
    runtime directory without copying files.  Works with both
    linked (junction) and normal (copied) plugin directories.
    """
    rt_dir = get_runtime_plugin_dir(plugin_id)
    is_linked = rt_dir.exists() and is_junction_or_symlink(rt_dir)

    url = f"{API_BASE}/plugins/{plugin_id}/reload"

    print(f"Hot-reloading plugin '{plugin_id}'...")
    if is_linked:
        print(f"  [LINKED] {rt_dir} -> source (junction)")
        print("  Backend code changes will be picked up.")
    else:
        source = get_plugin_source_dir(plugin_id)
        if source is None:
            print(f"[ERROR] Plugin '{plugin_id}' not found in bundle dirs.")
            sys.exit(1)
        print(f"  [NOT LINKED] Runtime: {rt_dir}")
        print(f"  Source:    {source}")
        print(
            f"  Warning: runtime files may be stale. Run 'link {plugin_id}' first.",
        )
    print(f"  → POST {url}")

    try:
        req = request.Request(
            url,
            data=b"",
            headers=_get_auth_headers(),
            method="POST",
        )
        with request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            print(f"\n[OK] {result.get('message', 'Plugin reloaded')}")
            print(f"  ID: {result.get('id')}")
            print(f"  Version: {result.get('version')}")
    except Exception as exc:
        print(f"\n[ERROR] Hot-reload failed: {exc}")
        print(f"  Make sure the backend is running at {API_BASE}")
        sys.exit(1)


def cmd_status() -> None:
    """Show link status for all bundled plugins."""
    print(f"Runtime plugins dir: {RUNTIME_PLUGINS_DIR}")
    print("Bundle dirs:")
    for d in BUNDLE_DIRS:
        print(f"  - {d}")
    print()

    # Collect all plugin IDs from bundle dirs
    all_plugins: dict[str, Path] = {}
    for bundle_dir in BUNDLE_DIRS:
        if not bundle_dir.is_dir():
            continue
        for item in bundle_dir.iterdir():
            if item.is_dir() and (item / "plugin.json").exists():
                manifest = json.loads(
                    (item / "plugin.json").read_text(encoding="utf-8"),
                )
                pid = manifest.get("id", item.name)
                if pid not in all_plugins:
                    all_plugins[pid] = item

    if not all_plugins:
        print("No bundled plugins found.")
        return

    print(
        f"{'Plugin ID':<20} {'Source':<12} {'Runtime':<12} {'Linked':<8} {'Version'}",
    )
    print("-" * 70)

    for pid, src_dir in sorted(all_plugins.items()):
        rt_dir = get_runtime_plugin_dir(pid)
        version = read_plugin_version(src_dir)
        src_exists = "Y" if src_dir.exists() else "N"
        rt_exists = "Y" if rt_dir.exists() else "N"
        linked = (
            "Y" if rt_dir.exists() and is_junction_or_symlink(rt_dir) else "N"
        )
        print(
            f"{pid:<20} {src_exists:<12} {rt_exists:<12} {linked:<8} v{version}",
        )


def cmd_build_ui(plugin_id: str) -> None:
    """Build plugin frontend (vite build)."""
    source = get_plugin_source_dir(plugin_id)
    if source is None:
        print(f"[ERROR] Plugin '{plugin_id}' not found in bundle dirs.")
        sys.exit(1)

    ui_dir = source / "ui"
    if not ui_dir.is_dir():
        print(f"[ERROR] No 'ui/' directory in plugin '{plugin_id}'.")
        sys.exit(1)

    # Check node_modules
    node_modules = ui_dir / "node_modules"
    if not node_modules.exists():
        print("[INFO] Installing UI dependencies...")
        npm = os.environ.get("npm_execpath", "npm")
        subprocess.run(
            [npm, "install"],
            cwd=str(ui_dir),
            check=True,
            shell=True,
        )

    print("[INFO] Building UI (vite build)...")
    subprocess.run(
        ["npx", "vite", "build"],
        cwd=str(ui_dir),
        check=True,
        shell=True,
    )

    dist_file = ui_dir / "dist" / "index.js"
    if dist_file.exists():
        print(f"\n[OK] Frontend built: {dist_file}")
        print(f"     Size: {dist_file.stat().st_size:,} bytes")
    else:
        print(f"\n[WARNING] Build output not found: {dist_file}")

    # If linked, the build output is already at runtime
    rt_dir = get_runtime_plugin_dir(plugin_id)
    if rt_dir.exists() and is_junction_or_symlink(rt_dir):
        print("\n[INFO] Plugin is linked -- build output is live at runtime.")
    else:
        print(f"\n[INFO] Plugin is NOT linked -- run 'link {plugin_id}' or")
        print(f"       'reload {plugin_id}' to sync to runtime.")


def cmd_watch_ui(plugin_id: str) -> None:
    """Watch plugin frontend (vite build --watch)."""
    source = get_plugin_source_dir(plugin_id)
    if source is None:
        print(f"[ERROR] Plugin '{plugin_id}' not found in bundle dirs.")
        sys.exit(1)

    ui_dir = source / "ui"
    if not ui_dir.is_dir():
        print(f"[ERROR] No 'ui/' directory in plugin '{plugin_id}'.")
        sys.exit(1)

    # Check node_modules
    node_modules = ui_dir / "node_modules"
    if not node_modules.exists():
        print("[INFO] Installing UI dependencies...")
        npm = os.environ.get("npm_execpath", "npm")
        subprocess.run(
            [npm, "install"],
            cwd=str(ui_dir),
            check=True,
            shell=True,
        )

    rt_dir = get_runtime_plugin_dir(plugin_id)
    is_linked = rt_dir.exists() and is_junction_or_symlink(rt_dir)

    print(f"[INFO] Starting vite watch mode for '{plugin_id}'...")
    print(f"  Source: {ui_dir}")
    print(f"  Output: {ui_dir / 'dist' / 'index.js'}")
    if is_linked:
        print(f"  Linked: {rt_dir} (changes are live immediately)")
    else:
        print(f"  NOT linked — run 'link {plugin_id}' for live updates")
    print()

    subprocess.run(
        ["npx", "vite", "build", "--watch"],
        cwd=str(ui_dir),
        shell=True,
        check=False,
    )


# ─── CLI ────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="Plugin development hot-reload helper.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Create junction: runtime → source (do this once)
  python scripts/dev_plugin_hotreload.py link ugsci

  # Watch frontend changes (vite --watch, auto-rebuilds on save)
  python scripts/dev_plugin_hotreload.py watch ugsci

  # Hot-reload backend changes via API (no restart)
  python scripts/dev_plugin_hotreload.py reload ugsci

  # Build frontend once
  python scripts/dev_plugin_hotreload.py build ugsci

  # Remove junction, restore normal sync
  python scripts/dev_plugin_hotreload.py unlink ugsci

  # Show status of all plugins
  python scripts/dev_plugin_hotreload.py status
""",
    )

    sub = parser.add_subparsers(dest="command", required=True)

    p_link = sub.add_parser("link", help="Link runtime dir → source dir")
    p_link.add_argument("plugin_id", help="Plugin ID (e.g. ugsci)")

    p_unlink = sub.add_parser(
        "unlink",
        help="Remove link, restore copy-based sync",
    )
    p_unlink.add_argument("plugin_id", help="Plugin ID")

    p_reload = sub.add_parser("reload", help="Hot-reload plugin via API")
    p_reload.add_argument("plugin_id", help="Plugin ID")

    p_build = sub.add_parser("build", help="Build plugin frontend")
    p_build.add_argument("plugin_id", help="Plugin ID")

    p_watch = sub.add_parser(
        "watch",
        help="Watch plugin frontend (vite --watch)",
    )
    p_watch.add_argument("plugin_id", help="Plugin ID")

    sub.add_parser("status", help="Show link status for all plugins")

    args = parser.parse_args()

    if args.command == "link":
        cmd_link(args.plugin_id)
    elif args.command == "unlink":
        cmd_unlink(args.plugin_id)
    elif args.command == "reload":
        cmd_reload(args.plugin_id)
    elif args.command == "build":
        cmd_build_ui(args.plugin_id)
    elif args.command == "watch":
        cmd_watch_ui(args.plugin_id)
    elif args.command == "status":
        cmd_status()


if __name__ == "__main__":
    main()
