# -*- coding: utf-8 -*-
"""Bundled plugin management.

On startup, copies plugins from the Python package's ``plugins/`` directory
into the user's ``~/.qwenpaw/plugins/`` directory so they are automatically
available without manual installation.

Hot-pluggable: if the user explicitly uninstalls a bundled plugin (via CLI
or API), a marker file ``.uninstalled`` is written inside the target
directory.  This function respects the marker and will NOT re-copy a plugin
that the user has intentionally removed.

Updating: if the bundled version is newer than the installed version
(compared via ``plugin.json`` → ``version`` field), the plugin is upgraded
in-place (unless the user has marked it as uninstalled).
"""

from __future__ import annotations

import json
import logging
import shutil
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def _get_bundled_plugins_dirs() -> list[Path]:
    """Return directories containing plugins bundled with the package.

    When installed via pip/wheel, bundled plugins live inside the package
    at ``qwenpaw/plugins_bundle/``.  When running from source (development),
    they live at ``<repo>/plugins/bundle/``.

    In the frozen desktop build (PyInstaller), both locations are
    packaged: ``qwenpaw/plugins_bundle/`` for package-bundled plugins
    and ``plugins/bundle/`` for repo-root plugins (cloudpaw, etc.).

    Returns:
        List of paths to bundled plugins directories.  May be empty
        if none are found.
    """
    result: list[Path] = []

    # When installed as a package, plugins are shipped inside the package
    try:
        import qwenpaw as _qp

        package_root = Path(_qp.__file__).parent
        bundled_dir = package_root / "plugins_bundle"
        if bundled_dir.is_dir():
            result.append(bundled_dir)
    except Exception:
        pass

    # Development mode / frozen desktop: look for plugins/bundle/
    # relative to repo root by walking up from this file.
    # In the frozen build, plugins/bundle/ is packaged at the bundle
    # root, so walking up from __file__ will find it.
    here = Path(__file__).resolve().parent
    for parent in [here, *here.parents]:
        candidate = parent / "plugins" / "bundle"
        if candidate.is_dir() and candidate not in result:
            result.append(candidate)
            break  # only need the first match

    return result


def _get_bundled_plugins_dir() -> Path | None:
    """Return the first bundled plugins directory, or ``None``.

    Kept for backward compatibility with callers that expect a single
    path.  New code should use :func:`_get_bundled_plugins_dirs`.
    """
    dirs = _get_bundled_plugins_dirs()
    return dirs[0] if dirs else None


def _read_manifest(plugin_dir: Path) -> dict[str, Any] | None:
    """Read and parse ``plugin.json`` from a plugin directory."""
    manifest_path = plugin_dir / "plugin.json"
    if not manifest_path.exists():
        return None
    try:
        with open(manifest_path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.warning("Failed to read %s: %s", manifest_path, exc)
        return None


def _is_uninstalled(plugin_dir: Path) -> bool:
    """Check if the user has explicitly uninstalled this plugin."""
    return (plugin_dir / ".uninstalled").exists()


def _mark_uninstalled(plugin_dir: Path) -> None:
    """Write a marker file so the plugin won't be re-installed on restart."""
    marker = plugin_dir / ".uninstalled"
    try:
        marker.write_text(
            "This plugin was explicitly uninstalled by the user.\n"
            "Delete this file to allow re-installation on next startup.\n",
            encoding="utf-8",
        )
    except Exception as exc:
        logger.warning("Failed to write uninstalled marker: %s", exc)


def _version_tuple(version: str) -> tuple:
    """Parse a semver-ish string into a comparable tuple."""
    parts: list[int] = []
    for part in version.replace("v", "").split("."):
        try:
            parts.append(int(part))
        except ValueError:
            # Keep non-numeric parts as 0 for comparison stability
            parts.append(0)
    return tuple(parts)


def ensure_bundled_plugins_installed() -> (
    list[str]
):  # pylint: disable=too-many-branches
    """Copy bundled plugins into the user's plugins directory.

    This function is idempotent and safe to call on every startup.
    It respects the ``.uninstalled`` marker — plugins the user has
    explicitly removed will NOT be re-installed.

    Returns:
        List of plugin IDs that were newly installed or updated.
    """
    from ..config.utils import get_plugins_dir

    bundled_dirs = _get_bundled_plugins_dirs()
    if not bundled_dirs:
        logger.debug("No bundled plugins directory found")
        return []

    plugins_dir = get_plugins_dir()
    plugins_dir.mkdir(parents=True, exist_ok=True)

    installed_or_updated: list[str] = []

    for bundled_dir in bundled_dirs:
        for item in sorted(bundled_dir.iterdir()):
            if not item.is_dir():
                continue
            manifest_path = item / "plugin.json"
            if not manifest_path.exists():
                continue

            bundled_manifest = _read_manifest(item)
            if bundled_manifest is None:
                continue

            plugin_id = bundled_manifest.get("id", item.name)
            target_dir = plugins_dir / plugin_id

            # Respect user's explicit uninstall — don't re-install
            if _is_uninstalled(target_dir):
                logger.debug(
                    "Skipping bundled plugin '%s' — user has uninstalled it",
                    plugin_id,
                )
                continue

            # Check if already installed and up-to-date
            if target_dir.exists():
                existing_manifest = _read_manifest(target_dir)
                if existing_manifest is not None:
                    existing_version = str(
                        existing_manifest.get("version", "0.0.0"),
                    )
                    bundled_version = str(
                        bundled_manifest.get("version", "0.0.0"),
                    )
                    if _version_tuple(existing_version) >= _version_tuple(
                        bundled_version,
                    ):
                        # Up to date — skip
                        continue
                    # Newer version available — upgrade
                    logger.info(
                        "Upgrading bundled plugin '%s' from %s to %s",
                        plugin_id,
                        existing_version,
                        bundled_version,
                    )
                    # Remove old version but preserve .uninstalled marker
                    has_marker = _is_uninstalled(target_dir)
                    shutil.rmtree(target_dir, ignore_errors=True)
                    shutil.copytree(item, target_dir)
                    if has_marker:
                        _mark_uninstalled(target_dir)
                    installed_or_updated.append(plugin_id)
                    continue

            # Fresh install
            logger.info("Installing bundled plugin '%s'", plugin_id)
            try:
                shutil.copytree(item, target_dir)
                installed_or_updated.append(plugin_id)
            except Exception as exc:
                logger.warning(
                    "Failed to copy bundled plugin '%s': %s",
                    plugin_id,
                    exc,
                )

    if installed_or_updated:
        logger.info(
            "Bundled plugins installed/updated: %s",
            ", ".join(installed_or_updated),
        )

    return installed_or_updated


def mark_plugin_uninstalled(plugin_id: str) -> bool:
    """Mark a plugin as explicitly uninstalled by the user.

    This prevents ``ensure_bundled_plugins_installed`` from re-installing
    it on the next startup.

    Args:
        plugin_id: The plugin's ID from its manifest.

    Returns:
        ``True`` if the marker was written, ``False`` if the plugin
        directory doesn't exist.
    """
    from ..config.utils import get_plugins_dir

    target_dir = get_plugins_dir() / plugin_id
    if not target_dir.exists():
        return False
    _mark_uninstalled(target_dir)
    return True


def clear_uninstalled_marker(plugin_id: str) -> bool:
    """Remove the ``.uninstalled`` marker so a plugin can be re-installed.

    Args:
        plugin_id: The plugin's ID from its manifest.

    Returns:
        ``True`` if the marker was removed, ``False`` if it didn't exist.
    """
    from ..config.utils import get_plugins_dir

    marker = get_plugins_dir() / plugin_id / ".uninstalled"
    if marker.exists():
        marker.unlink()
        return True
    return False
