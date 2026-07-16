#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pre-build verification: ensure frontend assets and plugin bundles are ready.

Run this BEFORE PyInstaller / Tauri build to catch stale or missing
frontend artifacts early — the most common cause of "desktop app looks
different from web dev" issues.

Checks:
  1. console/dist/index.html exists and references a JS bundle
  2. console/dist/assets/ has at least one .js file
  3. Every plugin with a ``frontend_entry`` in plugin.json has the
     corresponding dist file on disk
  4. console/dist/index.html is newer than console/src/main.tsx
     (staleness guard — warns, does not fail)
  5. Tauri CSP script-src includes blob: and http://127.0.0.1:*
     (required for plugin JS loading in the desktop webview)
  6. usePluginLoader.ts uses fetch + Blob URL as primary strategy
     (direct import() is silently blocked by CSP in WKWebView)

Usage:
    python scripts/pack-tauri/verify_build_assets.py
    python scripts/pack-tauri/verify_build_assets.py --strict   # fail on stale
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
from pathlib import Path

# Force UTF-8 output on Windows to avoid cp1252 UnicodeEncodeError with emoji.
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")


def _repo_root() -> Path:
    return Path(__file__).resolve().parent.parent.parent


def _check_console_dist(repo: Path) -> list[str]:
    """Verify console/dist/ exists and has expected content."""
    errors: list[str] = []
    dist = repo / "console" / "dist"
    index = dist / "index.html"

    if not index.is_file():
        errors.append(
            f"console/dist/index.html not found at {index}.\n"
            "  Run: cd console && npm run build:prod"
        )
        return errors

    html = index.read_text(encoding="utf-8")
    if "/assets/index-" not in html and "index-" not in html:
        errors.append(
            f"console/dist/index.html does not reference a JS bundle.\n"
            "  The build may be incomplete. Rebuild: cd console && npm run build:prod"
        )

    assets_dir = dist / "assets"
    if not assets_dir.is_dir() or not any(assets_dir.glob("*.js")):
        errors.append(
            f"console/dist/assets/ has no JS files.\n"
            "  Rebuild: cd console && npm run build:prod"
        )

    return errors


def _check_plugins(repo: Path) -> list[str]:
    """Verify every plugin with a frontend_entry has its dist file."""
    errors: list[str] = []
    plugins_bundle = repo / "plugins" / "bundle"

    if not plugins_bundle.is_dir():
        return errors  # No bundled plugins — nothing to check

    for plugin_dir in sorted(plugins_bundle.iterdir()):
        if not plugin_dir.is_dir():
            continue
        manifest_path = plugin_dir / "plugin.json"
        if not manifest_path.is_file():
            continue

        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"Failed to parse {manifest_path}: {exc}")
            continue

        frontend_entry = manifest.get("entry", {}).get("frontend")
        if not frontend_entry:
            continue

        dist_file = plugin_dir / frontend_entry
        if not dist_file.is_file():
            errors.append(
                f"Plugin '{manifest.get('id', plugin_dir.name)}' is missing "
                f"frontend bundle: {dist_file}\n"
                f"  Run: cd {plugin_dir / 'ui'} && npm ci && npm run build"
            )

    return errors


def _check_staleness(repo: Path, strict: bool = False) -> list[str]:
    """Warn (or fail in strict mode) if console/dist is older than source."""
    errors: list[str] = []
    dist_index = repo / "console" / "dist" / "index.html"
    main_tsx = repo / "console" / "src" / "main.tsx"
    host_externals = repo / "console" / "src" / "plugins" / "hostExternals.ts"
    use_plugin_loader = repo / "console" / "src" / "plugins" / "usePluginLoader.ts"

    if not dist_index.is_file():
        return errors  # Already caught by _check_console_dist

    dist_mtime = dist_index.stat().st_mtime

    for src_file in [main_tsx, host_externals, use_plugin_loader]:
        if src_file.is_file() and src_file.stat().st_mtime > dist_mtime:
            msg = (
                f"WARNING: {src_file.relative_to(repo)} is newer than "
                f"console/dist/index.html.\n"
                "  The frontend build is stale. Rebuild: "
                "cd console && npm run build:prod"
            )
            if strict:
                errors.append(msg)
            else:
                print(f"  [WARN] {msg}", file=sys.stderr)

    return errors


def _check_csp(repo: Path) -> list[str]:
    """Verify Tauri CSP allows plugin JS loading via blob: and http://127.0.0.1:*.

    In Tauri's WKWebView, dynamic import() of same-origin HTTP URLs is
    silently blocked by CSP without throwing an error. The plugin loader
    works around this by using fetch() + Blob URL import(), which requires
    ``blob:`` in ``script-src``. Direct import() as a fallback requires
    the HTTP origin to be listed as well.
    """
    errors: list[str] = []
    tauri_conf = repo / "console" / "src-tauri" / "tauri.conf.json"

    if not tauri_conf.is_file():
        # Not a Tauri project — skip
        return errors

    try:
        conf = json.loads(tauri_conf.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"Failed to parse {tauri_conf}: {exc}")
        return errors

    csp = conf.get("app", {}).get("security", {}).get("csp", {})
    if not csp:
        # No CSP configured — Tauri uses its default, which is permissive
        return errors

    script_src = csp.get("script-src", "")
    if not script_src:
        errors.append(
            f"{tauri_conf.relative_to(repo)}: CSP 'script-src' is empty.\n"
            "  Plugin JS loading requires 'blob:' and 'http://127.0.0.1:*'"
            " in script-src.\n"
            "  See usePluginLoader.ts for the loading strategy details."
        )
        return errors

    if "blob:" not in script_src:
        errors.append(
            f"{tauri_conf.relative_to(repo)}: CSP 'script-src' is missing"
            " 'blob:'.\n"
            "  Plugin JS loading uses fetch() + Blob URL import() as the"
            " primary strategy.\n"
            "  Without 'blob:' in script-src, plugins will silently fail"
            " to load\n"
            "  in the Tauri desktop webview."
        )

    if "http://127.0.0.1:*" not in script_src:
        errors.append(
            f"{tauri_conf.relative_to(repo)}: CSP 'script-src' is missing"
            " 'http://127.0.0.1:*'.\n"
            "  The fallback direct import() strategy requires the backend"
            " HTTP\n"
            "  origin to be in script-src. Without it, the fallback will"
            " also fail."
        )

    return errors


def _check_plugin_loader_strategy(repo: Path) -> list[str]:
    """Verify usePluginLoader.ts uses fetch + Blob URL as the primary strategy.

    The previous strategy (direct import() first, Blob URL fallback) fails
    silently in Tauri's WKWebView because CSP blocks import() of HTTP URLs
    without throwing an error. The correct strategy is:
    1. fetch() the JS text
    2. Create a Blob URL
    3. import() the Blob URL
    4. Fall back to direct import() only if the Blob approach fails
    """
    errors: list[str] = []
    loader_file = repo / "console" / "src" / "plugins" / "usePluginLoader.ts"

    if not loader_file.is_file():
        return errors  # Not found — other checks will report

    content = loader_file.read_text(encoding="utf-8")

    # Check that fetch + Blob URL appears BEFORE direct import() in the file.
    # The strategy comment should indicate Blob URL is primary.
    blob_url_idx = content.find("URL.createObjectURL")
    direct_import_idx = content.find("await import(")

    if blob_url_idx < 0:
        errors.append(
            f"{loader_file.relative_to(repo)}: Blob URL strategy not found.\n"
            "  The plugin loader must use fetch() + Blob URL import() as the\n"
            "  primary strategy to work in Tauri's WKWebView. Direct import()\n"
            "  of HTTP URLs is silently blocked by CSP."
        )
    elif direct_import_idx >= 0 and direct_import_idx < blob_url_idx:
        errors.append(
            f"{loader_file.relative_to(repo)}: Direct import() appears before\n"
            "  Blob URL strategy. In Tauri's WKWebView, import() of HTTP URLs\n"
            "  is silently blocked by CSP without throwing, so the Blob URL\n"
            "  fallback never executes. Reorder: fetch + Blob URL first,\n"
            "  direct import() as fallback."
        )

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify frontend and plugin build artifacts before packaging."
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Fail (non-zero exit) on stale builds, not just missing ones.",
    )
    args = parser.parse_args()

    repo = _repo_root()
    all_errors: list[str] = []

    print("=== Build Asset Verification ===")
    print(f"Repository: {repo}")
    print()

    # 1. console/dist
    print("[1/5] Checking console/dist/...")
    errs = _check_console_dist(repo)
    if errs:
        all_errors.extend(errs)
        for e in errs:
            print(f"  [FAIL] {e}")
    else:
        print("  [OK] console/dist/ is present and valid")

    # 2. Plugins
    print("[2/5] Checking plugin frontend bundles...")
    errs = _check_plugins(repo)
    if errs:
        all_errors.extend(errs)
        for e in errs:
            print(f"  [FAIL] {e}")
    else:
        print("  [OK] All plugin frontend bundles present")

    # 3. Staleness
    print("[3/5] Checking build freshness...")
    errs = _check_staleness(repo, strict=args.strict)
    if errs:
        all_errors.extend(errs)
        for e in errs:
            print(f"  [FAIL] {e}")
    else:
        print("  [OK] Build artifacts are up-to-date")

    # 4. Tauri CSP
    print("[4/5] Checking Tauri CSP script-src...")
    errs = _check_csp(repo)
    if errs:
        all_errors.extend(errs)
        for e in errs:
            print(f"  [FAIL] {e}")
    else:
        print("  [OK] CSP allows blob: and http://127.0.0.1:* for plugin loading")

    # 5. Plugin loader strategy
    print("[5/5] Checking plugin loader strategy...")
    errs = _check_plugin_loader_strategy(repo)
    if errs:
        all_errors.extend(errs)
        for e in errs:
            print(f"  [FAIL] {e}")
    else:
        print("  [OK] Plugin loader uses fetch + Blob URL as primary strategy")

    print()
    if all_errors:
        print(f"FAILED: {len(all_errors)} error(s) found.", file=sys.stderr)
        return 1

    print("All checks passed. [OK]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
