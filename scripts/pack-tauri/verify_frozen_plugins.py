#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify the complete runtime shape of desktop-bundled plugins."""

from __future__ import annotations

import json
import sys
from pathlib import Path


CRITICAL_PLUGINS = frozenset({"flowforge", "ugsci", "ugsci_research"})


def _safe_entry(root: Path, value: object, label: str) -> Path | None:
    if value in (None, ""):
        return None
    if not isinstance(value, str):
        raise ValueError(f"{label} must be a string")
    relative = Path(value)
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError(f"{label} is unsafe: {value}")
    target = (root / relative).resolve()
    try:
        target.relative_to(root.resolve())
    except ValueError as exc:
        raise ValueError(f"{label} escapes its plugin directory") from exc
    return target


def verify(root: Path) -> None:
    if not root.is_dir():
        raise ValueError(f"bundled plugin directory is missing: {root}")
    seen: set[str] = set()
    seen_dirs: set[str] = set()
    for manifest_path in sorted(root.glob("*/plugin.json")):
        plugin_root = manifest_path.parent
        real_plugin_root = str(plugin_root.resolve())
        if real_plugin_root in seen_dirs:
            raise ValueError(f"duplicate plugin directory alias: {manifest_path}")
        seen_dirs.add(real_plugin_root)
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        plugin_id = str(manifest.get("id") or "").strip()
        if not plugin_id or plugin_id in seen:
            raise ValueError(f"invalid or duplicate plugin id: {manifest_path}")
        seen.add(plugin_id)
        entry = manifest.get("entry")
        if not isinstance(entry, dict):
            raise ValueError(f"plugin {plugin_id} has no entry object")
        for kind in ("backend", "frontend"):
            target = _safe_entry(plugin_root, entry.get(kind), f"{plugin_id}.{kind}")
            if target is not None and not target.is_file():
                raise ValueError(
                    f"plugin {plugin_id} is missing {kind} entry: {target}",
                )
    missing = CRITICAL_PLUGINS - seen
    if missing:
        raise ValueError(
            "critical bundled plugins are missing: " + ", ".join(sorted(missing)),
        )
    print("Verified bundled plugins: " + ", ".join(sorted(seen)))


def main() -> int:
    if len(sys.argv) != 2:
        raise SystemExit("usage: verify_frozen_plugins.py <plugins_bundle>")
    try:
        verify(Path(sys.argv[1]))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        raise SystemExit(str(exc)) from exc
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
