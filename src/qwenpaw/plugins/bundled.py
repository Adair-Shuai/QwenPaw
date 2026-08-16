# -*- coding: utf-8 -*-
"""Bundled plugin management.

On startup, copies plugins from the Python package's ``plugins/`` directory
into the user's ``~/.qwenpaw/plugins/`` directory so they are automatically
available without manual installation.

Hot-pluggable: if the user explicitly uninstalls a bundled plugin (via CLI
or API), a persistent tombstone is written to
``plugins/.uninstalled/<plugin-id>``.  This function respects the tombstone
and will NOT re-copy a plugin that the user has intentionally removed.

Updating: if the bundled version is newer than the installed version
(compared via ``plugin.json`` → ``version`` field), the plugin is upgraded
in-place (unless the user has marked it as uninstalled).

Content hash: in a source checkout (development mode), when the version
numbers are equal, a content hash of the **entire plugin directory** (all
files, recursively) is compared to detect content changes made without a
version bump.  Packaged and installed applications deliberately do not read
or hash the plugin tree on startup: the bundled version plus the declared
entry files are the release integrity boundary.

Force mode: ``ensure_bundled_plugins_installed(force=True)`` bypasses the
version and content-hash checks, always re-copying every bundled plugin
(unless the user has explicitly uninstalled it via the ``.uninstalled``
marker).  This is exposed via the CLI command
``qwenpaw plugin sync-bundled --force``.
"""

# pylint: disable=too-many-branches,too-many-statements

from __future__ import annotations

import hashlib
import json
import logging
import os
import shutil
import sys
import tempfile
from pathlib import Path, PurePosixPath, PureWindowsPath
from typing import Any

from ..update_policy import DEFAULT_PRESERVE_PATHS

logger = logging.getLogger(__name__)

_BUNDLE_HASH_FILE = ".bundle_hash"  # development content hash (legacy API)
_BUNDLE_REVISION_FILE = ".bundle_revision"
_BUNDLE_COMPLETE_FILE = ".bundle_complete"
_BUNDLE_ACTIVATION_SUFFIX = ".bundled-activation.json"
_BUNDLE_PREVIOUS_SUFFIX = ".bundled-previous"
_BUNDLE_HASH_MODE_ENV = "QWENPAW_BUNDLED_PLUGIN_HASH"
_UNINSTALLED_DIR = ".uninstalled"
_UNINSTALLED_MESSAGE = (
    "This plugin was explicitly uninstalled by the user.\n"
    "Delete this file or reinstall the plugin to allow it again.\n"
)


def _is_development_environment() -> bool:
    """Return whether unversioned bundled-plugin edits should be detected.

    Hashing the complete plugin tree is useful for source checkouts, where a
    developer may edit files without bumping ``plugin.json``.  It is an
    avoidable startup cost for packaged applications, especially on Windows
    where the bundled tree can contain hundreds of megabytes and many files.

    ``QWENPAW_BUNDLED_PLUGIN_HASH`` is an explicit escape hatch for CI and
    diagnostics.  ``1/true/yes/on`` enables hashing and
    ``0/false/no/off`` disables it.  In the absence of an override, a
    non-frozen checkout containing both ``pyproject.toml`` and ``src/qwenpaw``
    is considered development mode.
    """
    override = os.environ.get(_BUNDLE_HASH_MODE_ENV, "").strip().lower()
    if override in {"1", "true", "yes", "on"}:
        return True
    if override in {"0", "false", "no", "off"}:
        return False

    # The desktop marker is set for packaged launches even when the Windows
    # fallback launcher invokes the standalone interpreter.  Treat that path
    # as production too; source-edit hashing can be explicitly re-enabled via
    # QWENPAW_BUNDLED_PLUGIN_HASH=1 when diagnosing a packaged build.
    if os.environ.get("QWENPAW_DESKTOP_APP") == "1":
        return False

    # A PyInstaller process is a packaged application even when the desktop
    # marker is present.  Never scan the full bundled tree in that process by
    # default.
    if bool(getattr(sys, "frozen", False)):
        return False

    here = Path(__file__).resolve()
    return any(
        (parent / "pyproject.toml").is_file()
        and (parent / "src" / "qwenpaw").is_dir()
        for parent in [here, *here.parents]
    )


# Plugins that are bundled in the repo but should NOT be auto-installed
# on startup.  Each entry is a plugin ID (from plugin.json → "id" field).
_BUNDLED_EXCLUDE: frozenset[str] = frozenset(
    {
        "cloudpaw",  # Alibaba Cloud deployment plugin — opt-in only
    },
)


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

    def add_candidate(candidate: Path) -> None:
        """Add a readable bundle directory once, preserving priority.

        PyInstaller's ``__file__`` layout is normally stable, but macOS app
        bundles can be launched through a symlinked helper or a relocated
        ``Contents/Resources`` tree.  In those cases ``qwenpaw.__file__`` may
        not be the only valid anchor.  Keep all fallback anchors explicit and
        de-duplicate by resolved path so a packaged launch never silently
        falls back to an empty source tree.
        """
        try:
            resolved = candidate.resolve()
        except OSError:
            return
        if resolved.is_dir() and resolved not in result:
            result.append(resolved)

    # When installed as a package, plugins are shipped inside the package
    try:
        import qwenpaw as _qp

        package_root = Path(_qp.__file__).parent
        add_candidate(package_root / "plugins_bundle")
    except Exception:
        pass

    # PyInstaller exposes the unpacked onedir root through ``_MEIPASS``.
    # Prefer the package-relative path above, then use these explicit fallbacks
    # for macOS .app relocations and alternate bootloader layouts.
    meipass = getattr(sys, "_MEIPASS", None)
    frozen_runtime = (
        bool(getattr(sys, "frozen", False))
        or bool(meipass)
        or os.environ.get("QWENPAW_DESKTOP_APP") == "1"
    )
    if meipass:
        meipass_root = Path(str(meipass))
        add_candidate(meipass_root / "qwenpaw" / "plugins_bundle")
        add_candidate(meipass_root / "plugins_bundle")
    try:
        executable_root = Path(sys.executable).resolve().parent
    except OSError:
        executable_root = None
    if executable_root is not None:
        add_candidate(
            executable_root / "_internal" / "qwenpaw" / "plugins_bundle",
        )
        add_candidate(executable_root / "qwenpaw" / "plugins_bundle")

    # Development mode only: look for plugins/bundle/. Frozen applications
    # must use only the signed package/_MEIPASS/executable roots above.
    # relative to repo root by walking up from this file.
    # In the frozen build, plugins/bundle/ is packaged at the bundle
    # root, so walking up from __file__ will find it.
    if frozen_runtime:
        return result

    here = Path(__file__).resolve().parent
    for parent in [here, *here.parents]:
        candidate = parent / "plugins" / "bundle"
        if candidate.is_dir() and candidate not in result:
            result.append(candidate)
            break  # only need the first match

    # Also scan plugins/apps/ — app-type plugins (e.g. agent-kanban)
    # live at a separate level from regular bundle plugins but are
    # loaded through the same PluginLoader pipeline once installed
    # into ~/.qwenpaw/plugins/.
    for parent in [here, *here.parents]:
        candidate = parent / "plugins" / "apps"
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


def validate_plugin_id(plugin_id: str) -> str:
    """Validate an ID before using it as a tombstone filename."""
    value = str(plugin_id or "")
    posix = PurePosixPath(value)
    windows = PureWindowsPath(value)
    unsafe = any(
        (
            not value,
            value != value.strip(),
            value in {".", ".."},
            "\x00" in value,
            posix.is_absolute(),
            windows.is_absolute(),
            bool(windows.drive),
            posix.name != value,
            windows.name != value,
        ),
    )
    if unsafe:
        raise ValueError(f"unsafe plugin id: {value!r}")
    return value


def _plugins_root(plugins_dir: Path | None = None) -> Path:
    if plugins_dir is not None:
        return Path(plugins_dir)
    from ..config.utils import get_plugins_dir

    return get_plugins_dir()


def _uninstalled_marker(
    plugin_id: str,
    *,
    plugins_dir: Path | None = None,
) -> Path:
    """Return the contained persistent tombstone path for ``plugin_id``."""
    safe_id = validate_plugin_id(plugin_id)
    root = _plugins_root(plugins_dir)
    marker = root / _UNINSTALLED_DIR / safe_id
    try:
        marker.resolve().relative_to(root.resolve())
    except (OSError, ValueError) as exc:
        raise ValueError(f"unsafe plugin tombstone path: {safe_id!r}") from exc
    return marker


def _write_uninstalled_marker(marker: Path) -> None:
    marker.parent.mkdir(parents=True, exist_ok=True)
    if marker.parent.is_symlink() or marker.is_symlink():
        raise ValueError("plugin tombstone path may not contain a symlink")
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=marker.parent,
            prefix=f".{marker.name}.",
            suffix=".tmp",
            delete=False,
        ) as handle:
            handle.write(_UNINSTALLED_MESSAGE)
            temporary = Path(handle.name)
        os.replace(temporary, marker)
        temporary = None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def is_plugin_uninstalled(
    plugin_id: str,
    *,
    plugins_dir: Path | None = None,
    plugin_dir: Path | None = None,
) -> bool:
    """Return whether a persistent or legacy uninstall marker exists.

    Legacy ``<plugin-dir>/.uninstalled`` markers are migrated best-effort to
    the persistent root.  If migration fails, the legacy marker still wins so
    a storage error can never resurrect an explicitly removed plugin.
    """
    root = _plugins_root(plugins_dir)
    marker = _uninstalled_marker(plugin_id, plugins_dir=root)
    legacy_dir = (
        Path(plugin_dir) if plugin_dir is not None else root / plugin_id
    )
    legacy = legacy_dir / ".uninstalled"
    if marker.exists():
        if legacy.exists() or legacy.is_symlink():
            try:
                legacy.unlink()
            except OSError:
                logger.debug(
                    "Unable to remove legacy uninstall marker %s",
                    legacy,
                    exc_info=True,
                )
        return True
    if not (legacy.exists() or legacy.is_symlink()):
        return False
    try:
        _write_uninstalled_marker(marker)
    except (OSError, ValueError):
        logger.warning(
            "Failed to migrate legacy uninstall marker for %s",
            plugin_id,
            exc_info=True,
        )
        return True
    try:
        legacy.unlink()
    except OSError:
        logger.debug(
            "Unable to remove migrated legacy uninstall marker %s",
            legacy,
            exc_info=True,
        )
    return True


def _is_uninstalled(plugin_dir: Path) -> bool:
    """Backward-compatible directory-based uninstall check."""
    manifest = _read_manifest(plugin_dir) or {}
    plugin_id = str(manifest.get("id") or plugin_dir.name)
    return is_plugin_uninstalled(
        plugin_id,
        plugins_dir=plugin_dir.parent,
        plugin_dir=plugin_dir,
    )


def _mark_uninstalled(plugin_dir: Path) -> None:
    """Backward-compatible directory-based tombstone writer."""
    manifest = _read_manifest(plugin_dir) or {}
    plugin_id = str(manifest.get("id") or plugin_dir.name)
    mark_plugin_uninstalled(plugin_id, plugins_dir=plugin_dir.parent)


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


# Files and directories excluded from the content hash.  These are
# internal markers or machine-generated artifacts that should not
# influence the update decision.
_HASH_EXCLUDED_NAMES = frozenset(
    {
        _BUNDLE_HASH_FILE,
        _BUNDLE_REVISION_FILE,
        _BUNDLE_COMPLETE_FILE,
        ".uninstalled",
        "__pycache__",
        "node_modules",
        ".git",
        # User-generated engine configs may exist in the plugin dir
        # on older installations.  Exclude from hash so they don't
        # trigger spurious updates (cf. BUG-009).
        *DEFAULT_PRESERVE_PATHS,
    },
)
_HASH_EXCLUDED_SUFFIXES = (".pyc", ".pyo")


def _copy_bundle(source: Path, target: Path) -> None:
    """Copy only runtime files; development dependencies never reach users."""
    shutil.copytree(
        source,
        target,
        ignore=shutil.ignore_patterns(
            "node_modules",
            "__pycache__",
            ".git",
            "*.pyc",
            "*.pyo",
            "*.map",
        ),
    )


def _installation_has_required_entries(
    plugin_dir: Path,
    manifest: dict[str, Any],
) -> bool:
    """Return whether the installed plugin still has every declared entry."""
    if not (plugin_dir / "plugin.json").is_file():
        return False
    entry = manifest.get("entry")
    if not isinstance(entry, dict):
        return True
    root = plugin_dir.resolve()
    for relative in entry.values():
        if not isinstance(relative, str) or not relative.strip():
            continue
        candidate = (plugin_dir / relative).resolve()
        try:
            candidate.relative_to(root)
        except ValueError:
            return False
        if not candidate.is_file():
            return False
    return True


def _copy_missing_tree(source: Path, target: Path) -> None:
    """Merge files missing from target without overwriting bundled files."""
    if not source.is_dir():
        return
    if not target.exists():
        shutil.copytree(source, target)
        return
    for path in source.rglob("*"):
        if not path.is_file():
            continue
        destination = target / path.relative_to(source)
        if destination.exists():
            continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, destination)


def _bundled_activation_paths(
    plugin_id: str,
    *,
    plugins_dir: Path,
) -> tuple[Path, Path, Path]:
    """Return the target, previous tree, and health-check marker paths."""
    safe_id = validate_plugin_id(plugin_id)
    root = Path(plugins_dir)
    return (
        root / safe_id,
        root / f".{safe_id}{_BUNDLE_PREVIOUS_SUFFIX}",
        root / f".{safe_id}{_BUNDLE_ACTIVATION_SUFFIX}",
    )


def _remove_plugin_tree(path: Path) -> None:
    """Remove one plugin tree without following a link-like entry."""
    if hasattr(os.path, "isjunction") and os.path.isjunction(str(path)):
        path.rmdir()
    elif path.is_symlink():
        path.unlink(missing_ok=True)
    elif path.exists():
        shutil.rmtree(path)


def _write_bundled_activation_marker(
    marker: Path,
    *,
    plugin_id: str,
    had_previous: bool,
) -> None:
    """Publish a marker only after the candidate tree is fully visible."""
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=marker.parent,
            prefix=f".{marker.name}.",
            suffix=".tmp",
            delete=False,
        ) as handle:
            json.dump(
                {
                    "schema_version": 1,
                    "plugin_id": plugin_id,
                    "had_previous": had_previous,
                },
                handle,
                sort_keys=True,
            )
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
            temporary = Path(handle.name)
        os.replace(temporary, marker)
        temporary = None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def finalize_bundled_plugin_activation(
    plugin_id: str,
    *,
    plugins_dir: Path | None = None,
) -> None:
    """Commit a bundled candidate after PluginLoader reports it healthy."""
    root = _plugins_root(plugins_dir)
    _target, previous, marker = _bundled_activation_paths(
        plugin_id,
        plugins_dir=root,
    )
    if previous.is_symlink() or marker.is_symlink():
        raise ValueError("bundled activation artifacts may not be symlinks")
    if previous.exists():
        shutil.rmtree(previous)
    marker.unlink(missing_ok=True)


def rollback_bundled_plugin_activation(
    plugin_id: str,
    *,
    plugins_dir: Path | None = None,
) -> bool:
    """Restore the last-known-good bundled tree after a failed load.

    Returns ``True`` when an older installation was restored. A failed first
    installation has no previous tree, so its broken candidate is removed.
    """
    root = _plugins_root(plugins_dir)
    target, previous, marker = _bundled_activation_paths(
        plugin_id,
        plugins_dir=root,
    )
    if previous.is_symlink() or marker.is_symlink():
        raise ValueError("bundled activation artifacts may not be symlinks")
    _remove_plugin_tree(target)
    restored = previous.is_dir()
    if restored:
        previous.replace(target)
    marker.unlink(missing_ok=True)
    return restored


def recover_interrupted_bundled_activation(
    plugin_id: str,
    *,
    plugins_dir: Path | None = None,
) -> bool:
    """Restore a candidate whose process exited before its health check."""
    root = _plugins_root(plugins_dir)
    _target, previous, marker = _bundled_activation_paths(
        plugin_id,
        plugins_dir=root,
    )
    if not marker.exists() and not previous.exists():
        return False
    logger.warning(
        "Recovering interrupted bundled plugin activation for '%s'",
        plugin_id,
    )
    rollback_bundled_plugin_activation(plugin_id, plugins_dir=root)
    return True


def _stage_and_replace_bundle(
    source: Path,
    target: Path,
    bundle_hash: str | None,
    preserve_dirs: frozenset[str],
    *,
    bundle_revision: str | None = None,
    defer_activation_cleanup: bool = False,
    plugin_id: str | None = None,
) -> None:
    """Build a complete replacement beside target and swap with rollback."""
    target.parent.mkdir(parents=True, exist_ok=True)
    staging_root = Path(
        tempfile.mkdtemp(
            prefix=f".{target.name}.staging-",
            dir=target.parent,
        ),
    )
    staged = staging_root / "plugin"
    # Keep the rollback copy outside ``staging_root``.  If Windows refuses
    # both the new-file rename and the rollback rename (for example because
    # an antivirus scanner briefly holds a handle), the unconditional
    # staging cleanup must not delete the user's last working installation.
    marker: Path | None = None
    if defer_activation_cleanup:
        activation_id = validate_plugin_id(plugin_id or target.name)
        _target, previous, marker = _bundled_activation_paths(
            activation_id,
            plugins_dir=target.parent,
        )
        if previous.exists() or marker.exists() or marker.is_symlink():
            raise RuntimeError(
                f"stale bundled activation exists for {activation_id}",
            )
    else:
        activation_id = plugin_id or target.name
        previous = target.parent / staging_root.name.replace(
            ".staging-",
            ".previous-",
            1,
        )
    try:
        _copy_bundle(source, staged)
        if target.is_dir():
            for dirname in preserve_dirs:
                _copy_missing_tree(target / dirname, staged / dirname)
        if bundle_hash is not None:
            _write_bundle_hash(staged, bundle_hash)
        if bundle_revision is not None:
            _write_bundle_revision(staged, bundle_revision)
        # This marker is part of the staged tree, so it becomes visible only
        # after the complete copy and atomic replacement have succeeded.
        _write_bundle_complete(staged, source)

        if target.exists():
            target.replace(previous)
        try:
            staged.replace(target)
        except Exception:
            if previous.exists() and not target.exists():
                try:
                    previous.replace(target)
                except Exception as rollback_exc:
                    logger.exception(
                        "Failed to restore previous bundled plugin at %s; "
                        "backup retained at %s",
                        target,
                        previous,
                    )
                    raise RuntimeError(
                        f"Failed to restore previous plugin; backup retained "
                        f"at {previous}",
                    ) from rollback_exc
            raise
        if marker is not None:
            try:
                _write_bundled_activation_marker(
                    marker,
                    plugin_id=activation_id,
                    had_previous=previous.exists(),
                )
            except Exception:
                failed = target.parent / f".{target.name}.bundled-failed"
                _remove_plugin_tree(failed)
                if target.exists():
                    target.replace(failed)
                if previous.exists() and not target.exists():
                    previous.replace(target)
                _remove_plugin_tree(failed)
                raise
        elif previous.exists():
            try:
                shutil.rmtree(previous)
            except OSError:
                # The replacement is already live.  A locked hidden backup
                # is harmless and safer than failing a successful startup.
                logger.warning(
                    "Could not remove previous bundled plugin backup at %s",
                    previous,
                    exc_info=True,
                )
    finally:
        shutil.rmtree(staging_root, ignore_errors=True)


# Directories inside a plugin installation that may contain user-generated
# data and must be preserved across updates (rmtree + copytree).  Files
# already present in the new bundle are kept; only **missing** files are
# restored from the backup so bundle updates take precedence for code.
# See BUG-009: engine configs were lost on plugin upgrade.
_PRESERVE_ON_UPDATE_DIRS = frozenset(DEFAULT_PRESERVE_PATHS)


def _compute_bundle_hash(plugin_dir: Path, manifest: dict[str, Any]) -> str:
    """Compute a content hash for a plugin directory.

    Hashes **all files** in the plugin directory recursively (excluding
    cache files and internal markers) so that any content change — not
    just changes to ``plugin.json`` or the frontend entry — triggers an
    update on a development checkout that already has the same version
    installed.  Callers must gate this function with
    :func:`_is_development_environment`; packaged startup must not scan the
    whole tree.
    """
    h = hashlib.md5()

    # Hash plugin.json content (normalised) — kept first for backward
    # compatibility so the beginning of the hash stream is unchanged.
    manifest_text = json.dumps(manifest, sort_keys=True, ensure_ascii=False)
    h.update(manifest_text.encode("utf-8"))

    # Collect every file in the plugin directory, sorted for determinism.
    all_files: list[Path] = []
    for f in plugin_dir.rglob("*"):
        if not f.is_file():
            continue
        rel = f.relative_to(plugin_dir)
        # Skip files inside excluded directories (e.g. __pycache__/x.pyc)
        if any(part in _HASH_EXCLUDED_NAMES for part in rel.parts[:-1]):
            continue
        # Skip excluded file names and suffixes
        if f.name in _HASH_EXCLUDED_NAMES:
            continue
        if f.suffix in _HASH_EXCLUDED_SUFFIXES:
            continue
        all_files.append(f)

    all_files.sort()

    for f in all_files:
        relative_name = f.relative_to(plugin_dir).as_posix()
        h.update(relative_name.encode("utf-8"))
        h.update(f.read_bytes())

    return h.hexdigest()


def _read_installed_hash(plugin_dir: Path) -> str | None:
    """Read the stored bundle hash from a previously installed plugin."""
    hash_file = plugin_dir / _BUNDLE_HASH_FILE
    if not hash_file.is_file():
        return None
    try:
        return hash_file.read_text(encoding="utf-8").strip()
    except Exception:
        return None


def _read_bundle_revision(plugin_dir: Path) -> str | None:
    revision_file = plugin_dir / _BUNDLE_REVISION_FILE
    try:
        revision = revision_file.read_text(encoding="utf-8").strip()
        return revision or None
    except OSError:
        return None


def _bundle_runtime_files(source: Path) -> list[str]:
    files: list[str] = []
    for path in source.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(source)
        if any(part in _HASH_EXCLUDED_NAMES for part in relative.parts[:-1]):
            continue
        if (
            path.name in _HASH_EXCLUDED_NAMES
            or path.suffix in _HASH_EXCLUDED_SUFFIXES
        ):
            continue
        if path.suffix == ".map":
            continue
        files.append(relative.as_posix())
    return sorted(files)


def _has_bundle_complete_marker(plugin_dir: Path) -> bool:
    marker = plugin_dir / _BUNDLE_COMPLETE_FILE
    try:
        payload = json.loads(marker.read_text(encoding="utf-8"))
        files = payload.get("files")
        if not isinstance(files, list):
            return False
        root = plugin_dir.resolve()
        for relative in files:
            if not isinstance(relative, str) or not relative:
                return False
            candidate = (plugin_dir / relative).resolve()
            candidate.relative_to(root)
            if not candidate.is_file():
                return False
        return True
    except (OSError, ValueError, TypeError, KeyError):
        return False


def _write_bundle_hash(plugin_dir: Path, hash_value: str) -> None:
    """Write the bundle hash so future startups can detect content changes."""
    hash_file = plugin_dir / _BUNDLE_HASH_FILE
    try:
        hash_file.write_text(hash_value, encoding="utf-8")
    except Exception as exc:
        logger.warning(
            "Failed to write bundle hash for %s: %s",
            plugin_dir,
            exc,
        )


def _write_bundle_revision(plugin_dir: Path, revision: str) -> None:
    try:
        (plugin_dir / _BUNDLE_REVISION_FILE).write_text(
            revision,
            encoding="utf-8",
        )
    except OSError as exc:
        raise OSError(
            f"Failed to write bundle revision for {plugin_dir}: {exc}",
        ) from exc


def _write_bundle_complete(plugin_dir: Path, source: Path) -> None:
    try:
        payload = {
            "format": 1,
            "files": _bundle_runtime_files(source),
        }
        (plugin_dir / _BUNDLE_COMPLETE_FILE).write_text(
            json.dumps(payload, separators=(",", ":")),
            encoding="utf-8",
        )
    except OSError as exc:
        # Do not publish a replacement that cannot prove it was fully staged;
        # the caller will retain the previous installation and retry later.
        raise OSError(
            "Failed to write bundle completion marker for "
            f"{plugin_dir}: {exc}",
        ) from exc


def _bundle_hash_for_install(
    source: Path,
    manifest: dict[str, Any],
    *,
    hash_enabled: bool,
) -> str:
    """Return a development content hash or a cheap release revision."""
    if not hash_enabled:
        raise ValueError("release installs do not use a content hash")
    return _compute_bundle_hash(source, manifest)


# pylint: disable=too-many-branches,too-many-statements
# pylint: disable=too-many-return-statements
def _install_or_update_plugin(
    item: Path,
    target_dir: Path,
    plugin_id: str,
    bundled_manifest: dict[str, Any],
    *,
    force: bool = False,
    defer_activation_cleanup: bool = False,
) -> bool:
    """Install or update a single bundled plugin.

    Returns True if the plugin was installed or updated.

    Args:
        force: When ``True``, bypass version and content-hash checks
            and always re-copy the plugin files.  The ``.uninstalled``
            marker is still respected (callers check it before calling
            this function).
    """
    bundled_version = str(bundled_manifest.get("version", "0.0.0"))
    hash_enabled = _is_development_environment()
    bundled_hash: str | None = None
    bundled_revision = f"version:{bundled_version}"

    # If target_dir is a junction/symlink (development convenience
    # for hot-reload), skip the update entirely — the link already
    # points to the source tree so content is always current.
    # Trying to rmtree/copytree a junction fails on Windows.
    if target_dir.exists() and (
        target_dir.is_symlink()
        or (
            hasattr(os.path, "isjunction")
            and os.path.isjunction(str(target_dir))
        )
    ):
        logger.debug(
            "Skipping bundled plugin '%s' — target is a junction/symlink",
            plugin_id,
        )
        return False

    if target_dir.exists():
        existing_manifest = _read_manifest(target_dir)
        if existing_manifest is not None and not force:
            existing_version = str(existing_manifest.get("version", "0.0.0"))
            existing_cmp = _version_tuple(existing_version)
            bundled_cmp = _version_tuple(bundled_version)

            if existing_cmp > bundled_cmp:
                return False  # Installed version is newer

            if existing_cmp == bundled_cmp:
                # Packaged bundles are immutable. A matching version and all
                # declared entry files are enough; do not read/hash the full
                # source tree on startup. Development keeps the full hash
                # check so unversioned source edits still sync.
                has_required_entries = _installation_has_required_entries(
                    target_dir,
                    bundled_manifest,
                )
                if not hash_enabled and has_required_entries:
                    # A complete marker is the cheap release integrity
                    # boundary. Missing marker means an interrupted/legacy
                    # install and forces one complete replacement.
                    if (
                        _has_bundle_complete_marker(target_dir)
                        and _read_bundle_revision(target_dir)
                        == bundled_revision
                    ):
                        return False
                    logger.warning(
                        "Repairing bundled plugin '%s': completion marker "
                        "or revision missing",
                        plugin_id,
                    )
                if not hash_enabled and not has_required_entries:
                    logger.warning(
                        "Repairing bundled plugin '%s': required entry "
                        "file is missing",
                        plugin_id,
                    )
                if hash_enabled:
                    installed_hash = _read_installed_hash(target_dir)
                    bundled_hash = _bundle_hash_for_install(
                        item,
                        bundled_manifest,
                        hash_enabled=True,
                    )
                    if (
                        installed_hash == bundled_hash
                        and _has_bundle_complete_marker(target_dir)
                    ):
                        return False  # Content identical and fully installed
                    logger.info(
                        "Updating bundled plugin '%s' v%s "
                        "(content hash changed or incomplete)",
                        plugin_id,
                        bundled_version,
                    )
            else:
                logger.info(
                    "Upgrading bundled plugin '%s' from %s to %s",
                    plugin_id,
                    existing_version,
                    bundled_version,
                )
        elif force:
            logger.info(
                "Force-updating bundled plugin '%s'",
                plugin_id,
            )

        if bundled_hash is None:
            if hash_enabled:
                bundled_hash = _bundle_hash_for_install(
                    item,
                    bundled_manifest,
                    hash_enabled=True,
                )
        _stage_and_replace_bundle(
            item,
            target_dir,
            bundled_hash,
            _PRESERVE_ON_UPDATE_DIRS,
            bundle_revision=None if hash_enabled else bundled_revision,
            defer_activation_cleanup=defer_activation_cleanup,
            plugin_id=plugin_id,
        )
        return True

    logger.info("Installing bundled plugin '%s'", plugin_id)
    try:
        if hash_enabled:
            bundled_hash = _bundle_hash_for_install(
                item,
                bundled_manifest,
                hash_enabled=True,
            )
        _stage_and_replace_bundle(
            item,
            target_dir,
            bundled_hash,
            frozenset(),
            bundle_revision=None if hash_enabled else bundled_revision,
            defer_activation_cleanup=defer_activation_cleanup,
            plugin_id=plugin_id,
        )
        return True
    except Exception as exc:
        logger.warning(
            "Failed to copy bundled plugin '%s': %s",
            plugin_id,
            exc,
        )
        return False


def ensure_bundled_plugins_installed(
    *,
    force: bool = False,
    skip_ids: set[str] | None = None,
    defer_activation_cleanup: bool = False,
) -> list[str]:
    """Copy bundled plugins into the user's plugins directory.

    This function is idempotent and safe to call on every startup.
    It respects the ``.uninstalled`` marker — plugins the user has
    explicitly removed will NOT be re-installed.

    Args:
        force: When ``True``, bypass version and content-hash checks
            and always re-copy every bundled plugin (unless the user
            has explicitly uninstalled it).  Useful for recovering
            from stale plugin states after a software upgrade.
        defer_activation_cleanup: Keep the previous tree and an activation
            marker until the startup PluginLoader confirms the candidate.
            Non-startup callers retain the legacy eager-finalize behavior.

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
    skip_ids = skip_ids or set()

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

            if plugin_id in skip_ids:
                logger.info(
                    "Skipping bundled sync for remotely updated plugin '%s'",
                    plugin_id,
                )
                continue

            if plugin_id in _BUNDLED_EXCLUDE:
                logger.debug(
                    "Skipping bundled plugin '%s' - excluded"
                    " from auto-install",
                    plugin_id,
                )
                continue

            target_dir = plugins_dir / plugin_id

            if is_plugin_uninstalled(
                plugin_id,
                plugins_dir=plugins_dir,
                plugin_dir=target_dir,
            ):
                logger.debug(
                    "Skipping bundled plugin '%s' — user has uninstalled it",
                    plugin_id,
                )
                continue

            try:
                # A prior process may have exited after publishing a bundled
                # candidate but before PluginLoader could confirm it. Restore
                # the last-known-good tree, then retry the current bundle.
                recover_interrupted_bundled_activation(
                    plugin_id,
                    plugins_dir=plugins_dir,
                )
                if _install_or_update_plugin(
                    item,
                    target_dir,
                    plugin_id,
                    bundled_manifest,
                    force=force,
                    defer_activation_cleanup=defer_activation_cleanup,
                ):
                    installed_or_updated.append(plugin_id)
            except Exception:
                logger.exception(
                    "Failed to sync bundled plugin '%s'",
                    plugin_id,
                )

    if installed_or_updated:
        logger.info(
            "Bundled plugins installed/updated: %s",
            ", ".join(installed_or_updated),
        )

    return installed_or_updated


def mark_plugin_uninstalled(
    plugin_id: str,
    *,
    plugins_dir: Path | None = None,
) -> bool:
    """Mark a plugin as explicitly uninstalled by the user.

    This prevents ``ensure_bundled_plugins_installed`` from re-installing
    it on the next startup.

    Args:
        plugin_id: The plugin's ID from its manifest.

    Returns:
        ``True`` when the persistent tombstone was written.  The plugin
        directory does not need to exist.
    """
    root = _plugins_root(plugins_dir)
    marker = _uninstalled_marker(plugin_id, plugins_dir=root)
    _write_uninstalled_marker(marker)
    legacy = root / validate_plugin_id(plugin_id) / ".uninstalled"
    if legacy.exists() or legacy.is_symlink():
        try:
            legacy.unlink()
        except OSError:
            logger.debug(
                "Unable to remove legacy uninstall marker %s",
                legacy,
                exc_info=True,
            )
    return True


def clear_uninstalled_marker(
    plugin_id: str,
    *,
    plugins_dir: Path | None = None,
) -> bool:
    """Remove the ``.uninstalled`` marker so a plugin can be re-installed.

    Args:
        plugin_id: The plugin's ID from its manifest.

    Returns:
        ``True`` if the marker was removed, ``False`` if it didn't exist.
    """
    root = _plugins_root(plugins_dir)
    safe_id = validate_plugin_id(plugin_id)
    markers = (
        _uninstalled_marker(safe_id, plugins_dir=root),
        root / safe_id / ".uninstalled",
    )
    changed = False
    for marker in markers:
        if marker.exists() or marker.is_symlink():
            marker.unlink()
            changed = True
    tombstone_root = root / _UNINSTALLED_DIR
    try:
        tombstone_root.rmdir()
    except OSError:
        pass
    return changed
