# -*- coding: utf-8 -*-
"""Stage an Awsome-tools recipe using hash-locked, prebuilt dependencies."""

import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys

from qwenpaw.components.update import detect_target, _is_link_like
from qwenpaw.expert_packages.models import relative_path


def prepare(recipe: Path, output: Path):
    spec = json.loads(recipe.read_text(encoding="utf-8"))
    if spec.get("schema_version") != "expert-recipe.v1":
        raise ValueError("Unsupported expert recipe")
    current = (
        detect_target(),
        f"{sys.version_info.major}.{sys.version_info.minor}",
    )
    variants = [
        v for v in spec["variants"] if (v["target"], v["python"]) == current
    ]
    if len(variants) != 1:
        raise ValueError("Recipe has no unique locked variant for this runner")
    base = recipe.parent.resolve()
    source = base / "payload"
    lock = base / relative_path(variants[0]["lock"])
    if (
        not source.is_dir()
        or not lock.is_file()
        or not lock.resolve().is_relative_to(base)
    ):
        raise ValueError("Recipe payload or dependency lock missing")
    if _is_link_like(source) or any(
        _is_link_like(p) for p in source.rglob("*")
    ):
        raise ValueError("Recipe payload cannot contain links")
    if output.exists():
        raise ValueError("Staging directory must be new")
    output.mkdir(parents=True)
    payload = output / "payload"
    shutil.copytree(source, payload)
    wheels = payload / "wheels"
    wheels.mkdir(exist_ok=False)
    # Authors supply exact versions and hashes for every transitive dependency.
    subprocess.run(
        [
            sys.executable,
            "-m",
            "pip",
            "--isolated",
            "download",
            "--require-hashes",
            "--only-binary=:all:",
            "--dest",
            str(wheels.resolve()),
            "-r",
            str(lock),
        ],
        cwd=base,
        check=True,
    )
    shutil.copy2(lock, payload / "dependency-lock.txt")
    release = {
        **spec["release"],
        "target": current[0],
        "python": current[1],
        "wheels": sorted(
            p.relative_to(payload).as_posix() for p in wheels.glob("*.whl")
        ),
    }
    (output / "recipe.json").write_text(
        json.dumps(release, ensure_ascii=False),
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--recipe", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    prepare(args.recipe, args.output)


if __name__ == "__main__":
    main()
