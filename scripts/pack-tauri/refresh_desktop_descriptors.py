# -*- coding: utf-8 -*-
"""Refresh component identities after transformations such as macOS signing."""

import argparse
import json
from pathlib import Path

from stage_desktop_components import describe_component


def refresh(binaries: Path, version: str, active: dict | None = None) -> dict:
    pointer = binaries / "state" / "active.json"
    if active is None:
        active = json.loads(pointer.read_text(encoding="utf-8"))
    for component, record in active["components"].items():
        source = binaries.parent / record["path"]
        if not source.resolve().is_relative_to(binaries.resolve()):
            raise ValueError("component path escapes binaries directory")
        descriptor = describe_component(source, component, record, version)
        (source / "component.json").write_text(
            json.dumps(
                descriptor, ensure_ascii=False, indent=2, sort_keys=True
            )
            + "\n",
            encoding="utf-8",
            newline="\n",
        )
        record["version"] = descriptor["version"]
    pointer.parent.mkdir(parents=True, exist_ok=True)
    pointer.write_text(
        json.dumps(active, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    return active


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--binaries", type=Path, required=True)
    parser.add_argument("--version", required=True)
    args = parser.parse_args()
    refresh(args.binaries.resolve(), args.version)
