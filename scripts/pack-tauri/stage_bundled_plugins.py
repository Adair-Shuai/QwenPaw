# -*- coding: utf-8 -*-
"""Discover and stage desktop-bundled plugins with a denylist policy."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

# Plugins excluded from the desktop bundle. Users install these on demand
# from the plugin market instead of receiving them in every release.
#   cloudpaw / qwenpaw-pet : already excluded (in plugins/bundle).
#   qwenpaw-creator        : heavy geospatial/3D deps (geopandas, trimesh,
#                            matplotlib, playwright); pulls ~GBs into the
#                            installer and slows startup, so ship it via the
#                            market rather than bundled.
#   azure-bot              : lives in plugins/channel (not a default bundled
#                            root) but listed here for explicit intent.
PLUGIN_DENYLIST = frozenset(
    {"cloudpaw", "qwenpaw-pet", "qwenpaw-creator", "azure-bot"},
)
DEFAULT_PLUGIN_ROOTS = ("bundle", "apps")
_IGNORED_NAMES = frozenset(
    {
        ".git",
        ".mypy_cache",
        ".pytest_cache",
        ".ruff_cache",
        "__pycache__",
        "node_modules",
    },
)


def plugin_id(plugin_dir: Path) -> str:
    """Return the manifest ID for one plugin directory."""
    manifest = json.loads(
        (plugin_dir / "plugin.json").read_text(encoding="utf-8"),
    )
    value = str(manifest.get("id", "")).strip()
    if not value:
        raise ValueError(f"Plugin manifest has no id: {plugin_dir}")
    return value


def discover_bundled_plugins(
    repo: Path,
    plugin_roots: tuple[str, ...] | None = None,
) -> list[Path]:
    """Return every manifest plugin except explicitly denied plugin IDs."""
    plugins_root = repo / "plugins"
    selected: list[Path] = []
    destination_names: dict[str, Path] = {}
    component_ids: dict[str, Path] = {}
    roots = (
        DEFAULT_PLUGIN_ROOTS if plugin_roots is None else tuple(plugin_roots)
    )
    for root_name in roots:
        for manifest in sorted(
            (plugins_root / root_name).glob("*/plugin.json"),
        ):
            plugin_dir = manifest.parent
            identifier = plugin_id(plugin_dir)
            previous_id = component_ids.get(identifier)
            if previous_id is not None:
                raise ValueError(
                    "Bundled plugins share a manifest id: "
                    f"{previous_id} and {plugin_dir}",
                )
            component_ids[identifier] = plugin_dir
            if identifier in PLUGIN_DENYLIST:
                continue
            previous = destination_names.get(plugin_dir.name)
            if previous is not None:
                raise ValueError(
                    "Bundled plugins share a destination name: "
                    f"{previous} and {plugin_dir}",
                )
            destination_names[plugin_dir.name] = plugin_dir
            selected.append(plugin_dir)
    return selected


def iter_runtime_files(plugin_dir: Path):
    """Yield plugin files while excluding local build and cache trees."""
    for path in plugin_dir.rglob("*"):
        relative = path.relative_to(plugin_dir)
        if any(part in _IGNORED_NAMES for part in relative.parts):
            continue
        if path.is_file() and path.suffix not in {".pyc", ".pyo"}:
            yield path


def stage_bundled_plugins(
    repo: Path,
    destination: Path,
    plugin_roots: tuple[str, ...] | None = None,
) -> list[str]:
    """Replace destination with the complete selected runtime plugin set."""
    shutil.rmtree(destination, ignore_errors=True)
    destination.mkdir(parents=True, exist_ok=True)
    staged: list[str] = []
    for source in discover_bundled_plugins(repo, plugin_roots=plugin_roots):
        target = destination / source.name
        for source_file in iter_runtime_files(source):
            relative = source_file.relative_to(source)
            target_file = target / relative
            target_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_file, target_file)
        identifier = plugin_id(target)
        staged.append(identifier)
    return staged


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--dest", type=Path)
    parser.add_argument("--list-sources", action="store_true")
    parser.add_argument("--plugin-roots", nargs="*", default=None)
    args = parser.parse_args()
    repo = args.repo.resolve()
    plugin_roots = tuple(args.plugin_roots) if args.plugin_roots else None
    if args.list_sources:
        for plugin_dir in discover_bundled_plugins(
            repo,
            plugin_roots=plugin_roots,
        ):
            print(plugin_dir)
        return 0
    if args.dest is None:
        parser.error("--dest is required unless --list-sources is used")
    staged = stage_bundled_plugins(
        repo,
        args.dest.resolve(),
        plugin_roots=plugin_roots,
    )
    print("Bundled plugins: " + ", ".join(staged))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
