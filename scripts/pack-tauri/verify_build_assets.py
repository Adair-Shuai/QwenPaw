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
  7. Plugin dist files are synced between plugins/bundle/ and
     src/qwenpaw/plugins_bundle/ (PyInstaller bundles from both)
  8. Plugin source files are not newer than their dist bundles
     (catches stale plugin builds)
  9. Tauri CSP connect-src includes http://127.0.0.1:* for backend
     fetch() calls from the bootstrap page

Usage:
    python scripts/pack-tauri/verify_build_assets.py
    python scripts/pack-tauri/verify_build_assets.py --strict   # fail on stale
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import io
import json
import sys
from pathlib import Path


def _plugin_packaging_helper(repo: Path):
    helper_path = repo / "scripts" / "pack-tauri" / "stage_bundled_plugins.py"
    spec = importlib.util.spec_from_file_location(
        "qwenpaw_bundled_plugin_stage",
        helper_path,
    )
    if spec is None or spec.loader is None:
        raise RuntimeError(
            f"Cannot load plugin packaging helper: {helper_path}",
        )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# Force UTF-8 output on Windows to avoid cp1252 UnicodeEncodeError with emoji.
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(
        sys.stdout.buffer,
        encoding="utf-8",
        errors="replace",
    )
    sys.stderr = io.TextIOWrapper(
        sys.stderr.buffer,
        encoding="utf-8",
        errors="replace",
    )


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
            "  Run: cd console && npm run build:prod",
        )
        return errors

    html = index.read_text(encoding="utf-8")
    if "/assets/index-" not in html and "index-" not in html:
        errors.append(
            "console/dist/index.html does not reference a JS bundle.\n"
            "  The build may be incomplete. Rebuild: cd console && npm run build:prod",
        )

    assets_dir = dist / "assets"
    if not assets_dir.is_dir() or not any(assets_dir.glob("*.js")):
        errors.append(
            "console/dist/assets/ has no JS files.\n"
            "  Rebuild: cd console && npm run build:prod",
        )
        return errors

    # Release verification relies on this command being present in the actual
    # bundled SPA. Timestamp-only checks can be fooled by copied/generated
    # files, so assert the production JavaScript contains the native reporter.
    required_markers = {
        "report_ui_verification": (
            "native Tauri WebView plugin verification reporter"
        ),
    }
    javascript = list(assets_dir.glob("*.js"))
    for marker, label in required_markers.items():
        if not any(
            marker in path.read_text(encoding="utf-8", errors="ignore")
            for path in javascript
        ):
            errors.append(
                f"console/dist is missing the {label} ({marker}).\n"
                "  The frontend build is stale or incomplete. Rebuild: "
                "cd console && npm run build:prod",
            )

    return errors


def _check_plugins(repo: Path) -> list[str]:
    """Verify every plugin with a frontend_entry has its dist file."""
    errors: list[str] = []
    try:
        plugin_dirs = _plugin_packaging_helper(repo).discover_bundled_plugins(
            repo,
        )
    except Exception as exc:
        return [f"Failed to discover bundled plugins: {exc}"]

    for plugin_dir in plugin_dirs:
        manifest_path = plugin_dir / "plugin.json"

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
                f"  Run: cd {plugin_dir / 'ui'} && npm ci && npm run build",
            )

    return errors


def _check_staleness(repo: Path, strict: bool = False) -> list[str]:
    """Warn (or fail in strict mode) if console/dist is older than source."""
    errors: list[str] = []
    dist_index = repo / "console" / "dist" / "index.html"
    source_root = repo / "console" / "src"

    if not dist_index.is_file():
        return errors  # Already caught by _check_console_dist

    dist_mtime = dist_index.stat().st_mtime

    source_suffixes = {".css", ".json", ".less", ".ts", ".tsx"}
    newer_sources = sorted(
        path
        for path in source_root.rglob("*")
        if path.is_file()
        and path.suffix in source_suffixes
        and ".test." not in path.name
        and "__tests__" not in path.parts
        and path.stat().st_mtime > dist_mtime
    )
    if newer_sources:
        preview = ", ".join(
            str(path.relative_to(repo)) for path in newer_sources[:8]
        )
        if len(newer_sources) > 8:
            preview += f", ... (+{len(newer_sources) - 8} more)"
        msg = (
            f"WARNING: console source files are newer than console/dist/index.html: "
            f"{preview}.\n"
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
            "  See usePluginLoader.ts for the loading strategy details.",
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
            "  in the Tauri desktop webview.",
        )

    if "http://127.0.0.1:*" not in script_src:
        errors.append(
            f"{tauri_conf.relative_to(repo)}: CSP 'script-src' is missing"
            " 'http://127.0.0.1:*'.\n"
            "  The fallback direct import() strategy requires the backend"
            " HTTP\n"
            "  origin to be in script-src. Without it, the fallback will"
            " also fail.",
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
            "  of HTTP URLs is silently blocked by CSP.",
        )
    elif 0 <= direct_import_idx < blob_url_idx:
        errors.append(
            f"{loader_file.relative_to(repo)}: Direct import() appears before\n"
            "  Blob URL strategy. In Tauri's WKWebView, import() of HTTP URLs\n"
            "  is silently blocked by CSP without throwing, so the Blob URL\n"
            "  fallback never executes. Reorder: fetch + Blob URL first,\n"
            "  direct import() as fallback.",
        )

    return errors


def _check_plugin_sync(repo: Path) -> list[str]:
    """Verify plugin dist files are synced between plugins/bundle/ and
    src/qwenpaw/plugins_bundle/.

    PyInstaller bundles plugins from BOTH locations (see qwenpaw.spec):
      - src/qwenpaw/plugins_bundle/ -> qwenpaw/plugins_bundle/ (package data)
      - plugins/bundle/{name}/      -> plugins/bundle/{name}/   (repo root)

    Only plugins that have a mirror in src/qwenpaw/plugins_bundle/ are
    checked. Plugins without a mirror (e.g. cloudpaw, qwenpaw-pet) are
    excluded from the PyInstaller whitelist and don't need syncing.
    """
    errors: list[str] = []
    plugins_bundle = repo / "plugins" / "bundle"
    src_mirror = repo / "src" / "qwenpaw" / "plugins_bundle"

    if not plugins_bundle.is_dir() or not src_mirror.is_dir():
        return errors

    for plugin_dir in sorted(plugins_bundle.iterdir()):
        if not plugin_dir.is_dir():
            continue
        manifest_path = plugin_dir / "plugin.json"
        if not manifest_path.is_file():
            continue

        # Only check plugins that have a mirror directory in src/
        mirror_plugin_dir = src_mirror / plugin_dir.name
        if not mirror_plugin_dir.is_dir():
            continue  # Not in PyInstaller package path — skip

        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except Exception:
            continue

        frontend_entry = manifest.get("entry", {}).get("frontend")
        if not frontend_entry:
            continue

        # Check that the src/ mirror has the dist file
        mirror_dist = mirror_plugin_dir / frontend_entry
        if not mirror_dist.is_file():
            errors.append(
                f"Plugin '{plugin_dir.name}': dist file missing in"
                f" src/qwenpaw/plugins_bundle/{plugin_dir.name}/{frontend_entry}\n"
                "  PyInstaller bundles from both plugins/bundle/ and"
                " src/qwenpaw/plugins_bundle/.\n"
                "  Run: bash scripts/pack-tauri/build_plugin_uis.sh",
            )
            continue

        # Compare content hash to ensure sync
        orig_file = plugin_dir / frontend_entry
        if not orig_file.is_file():
            continue  # Already caught by _check_plugins

        orig_hash = hashlib.md5(orig_file.read_bytes()).hexdigest()
        mirror_hash = hashlib.md5(mirror_dist.read_bytes()).hexdigest()

        if orig_hash != mirror_hash:
            errors.append(
                f"Plugin '{plugin_dir.name}': dist file out of sync.\n"
                f"  plugins/bundle/{plugin_dir.name}/{frontend_entry}"
                f" (MD5: {orig_hash[:8]})\n"
                f"  != src/qwenpaw/plugins_bundle/{plugin_dir.name}/"
                f"{frontend_entry} (MD5: {mirror_hash[:8]})\n"
                "  Run: bash scripts/pack-tauri/build_plugin_uis.sh",
            )

    return errors


def _check_single_plugin_staleness(
    plugin_dir: Path,
    repo: Path,
    strict: bool,
) -> list[str]:
    """Check a single plugin's source files vs dist bundle for staleness."""
    errors: list[str] = []
    manifest_path = plugin_dir / "plugin.json"
    if not manifest_path.is_file():
        return errors

    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception:
        return errors

    frontend_entry = manifest.get("entry", {}).get("frontend")
    if not frontend_entry:
        return errors

    dist_file = plugin_dir / frontend_entry
    if not dist_file.is_file():
        return errors  # Already caught by _check_plugins

    dist_mtime = dist_file.stat().st_mtime

    ui_src = plugin_dir / "ui" / "src"
    if not ui_src.is_dir():
        return errors

    for src_file in ui_src.rglob("*.ts*"):
        if src_file.stat().st_mtime <= dist_mtime:
            continue
        msg = (
            f"Plugin '{plugin_dir.name}': {src_file.relative_to(repo)}"
            f" is newer than {dist_file.relative_to(repo)}.\n"
            "  Plugin dist bundle is stale. Rebuild:"
            f" cd {plugin_dir / 'ui'} && npm run build"
        )
        if strict:
            errors.append(msg)
        else:
            print(f"  [WARN] {msg}", file=sys.stderr)
        break  # One stale file is enough to warn

    return errors


def _check_plugin_staleness(repo: Path, strict: bool = False) -> list[str]:
    """Warn (or fail in strict mode) if plugin source files are newer than
    their built dist bundles.

    Catches the case where a developer edits plugin source but forgets
    to rebuild the dist bundle. Only checks plugins that have a mirror
    in src/qwenpaw/plugins_bundle/ (i.e. plugins bundled in the desktop
    build via the PyInstaller whitelist).
    """
    errors: list[str] = []
    plugins_bundle = repo / "plugins" / "bundle"
    src_mirror = repo / "src" / "qwenpaw" / "plugins_bundle"

    if not plugins_bundle.is_dir():
        return errors

    for plugin_dir in sorted(plugins_bundle.iterdir()):
        if not plugin_dir.is_dir():
            continue
        # Only check plugins that have a mirror in src/ (PyInstaller whitelist)
        if not (src_mirror / plugin_dir.name).is_dir():
            continue
        errors.extend(
            _check_single_plugin_staleness(
                plugin_dir,
                repo,
                strict,
            ),
        )

    return errors


def _check_csp_connect_src(repo: Path) -> list[str]:
    """Verify Tauri CSP connect-src includes http://127.0.0.1:*.

    The bootstrap page (loaded by Tauri's webview) makes fetch() calls to
    http://127.0.0.1:{port}/api/version to detect backend readiness.
    Without http://127.0.0.1:* in connect-src, these calls are blocked
    by CSP and the app hangs on the loading screen.
    """
    errors: list[str] = []
    tauri_conf = repo / "console" / "src-tauri" / "tauri.conf.json"

    if not tauri_conf.is_file():
        return errors

    try:
        conf = json.loads(tauri_conf.read_text(encoding="utf-8"))
    except Exception:
        return errors  # Already caught by _check_csp

    csp = conf.get("app", {}).get("security", {}).get("csp", {})
    if not csp:
        return errors

    connect_src = csp.get("connect-src", "")
    if not connect_src:
        errors.append(
            f"{tauri_conf.relative_to(repo)}: CSP 'connect-src' is empty.\n"
            "  The bootstrap page needs http://127.0.0.1:* in connect-src\n"
            "  to poll the backend readiness endpoint.",
        )
        return errors

    if "http://127.0.0.1:*" not in connect_src:
        errors.append(
            f"{tauri_conf.relative_to(repo)}: CSP 'connect-src' is missing"
            " 'http://127.0.0.1:*'.\n"
            "  The bootstrap page fetches http://127.0.0.1:{port}/api/version\n"
            "  to detect when the backend is ready. Without this entry, the\n"
            "  app will hang on the loading screen.",
        )

    return errors


def _run_check(
    name: str,
    step: int,
    total: int,
    errors: list[str],
    ok_msg: str,
) -> None:
    """Print the result of a single check step."""
    print(f"[{step}/{total}] Checking {name}...")
    if errors:
        for e in errors:
            print(f"  [FAIL] {e}")
    else:
        print(f"  [OK] {ok_msg}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verify frontend and plugin build artifacts before packaging.",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Fail (non-zero exit) on stale builds, not just missing ones.",
    )
    args = parser.parse_args()

    repo = _repo_root()
    all_errors: list[str] = []
    total = 8

    print("=== Build Asset Verification ===")
    print(f"Repository: {repo}")
    print()

    # 1. console/dist
    errs = _check_console_dist(repo)
    all_errors.extend(errs)
    _run_check(
        "console/dist/",
        1,
        total,
        errs,
        "console/dist/ is present and valid",
    )

    # 2. Plugins
    errs = _check_plugins(repo)
    all_errors.extend(errs)
    _run_check(
        "plugin frontend bundles",
        2,
        total,
        errs,
        "All plugin frontend bundles present",
    )

    # 3. Staleness (console + plugins)
    errs = _check_staleness(repo, strict=args.strict)
    all_errors.extend(errs)
    errs2 = _check_plugin_staleness(repo, strict=args.strict)
    all_errors.extend(errs2)
    combined = errs + errs2
    _run_check(
        "build freshness",
        3,
        total,
        combined,
        "Build artifacts are up-to-date",
    )

    # 4. Tauri CSP (script-src + connect-src)
    csp_errs = _check_csp(repo) + _check_csp_connect_src(repo)
    all_errors.extend(csp_errs)
    _run_check(
        "Tauri CSP",
        4,
        total,
        csp_errs,
        "CSP allows blob:, http://127.0.0.1:*",
    )

    # 5. Plugin loader strategy
    errs = _check_plugin_loader_strategy(repo)
    all_errors.extend(errs)
    _run_check(
        "plugin loader strategy",
        5,
        total,
        errs,
        "Plugin loader uses fetch + Blob URL as primary strategy",
    )

    # 6. Plugin dist sync
    errs = _check_plugin_sync(repo)
    all_errors.extend(errs)
    _run_check(
        "plugin dist sync",
        6,
        total,
        errs,
        "Plugin dist files synced",
    )

    # 7. Console source staleness (already checked in step 3)
    print(f"[7/{total}] Checking console source staleness...")
    if not any("stale" in e.lower() for e in all_errors):
        print("  [OK] Console source files are not newer than dist")

    # 8. Plugin source staleness (already checked in step 3)
    print(f"[8/{total}] Checking plugin source staleness...")
    if not any(
        "plugin" in e.lower() and "stale" in e.lower() for e in all_errors
    ):
        print("  [OK] Plugin source files are not newer than dist bundles")

    print()
    if all_errors:
        print(f"FAILED: {len(all_errors)} error(s) found.", file=sys.stderr)
        return 1

    print("All checks passed. [OK]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
