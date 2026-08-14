#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build independently versioned Python dependency and QwenPaw backend layers."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile


def _run(command: list[str], *, cwd: Path, env: dict[str, str] | None = None) -> None:
    subprocess.run(command, cwd=cwd, env=env, check=True)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _dependency_version(lock_hash: str) -> str:
    """Return a stable PEP 440 version for a dependency lock digest."""
    if len(lock_hash) < 16 or any(char not in "0123456789abcdef" for char in lock_hash):
        raise ValueError("desktop requirements digest must be lowercase SHA-256")
    return f"0+sha.{lock_hash[:16]}"


def _safe_empty(path: Path, parent: Path) -> None:
    resolved = path.resolve()
    root = parent.resolve()
    if resolved == root or root not in resolved.parents:
        raise ValueError(f"refusing to replace layer outside {root}: {resolved}")
    if resolved.exists():
        shutil.rmtree(resolved)
    resolved.mkdir(parents=True)


def build_layers(
    repo: Path,
    host_python: Path,
    runtime_python: Path,
    output: Path,
    version: str,
) -> dict[str, object]:
    lock = repo / "requirements-desktop.lock"
    if not lock.is_file():
        raise FileNotFoundError(
            "requirements-desktop.lock is required for a reproducible desktop layer",
        )
    if not runtime_python.is_file():
        raise FileNotFoundError(f"standalone Python is missing: {runtime_python}")

    lock_hash = _sha256(lock)
    # Component versions are parsed with packaging.version.Version at runtime.
    # A raw digest may begin with a letter, so encode it as valid PEP 440 local
    # version metadata while retaining a stable content-derived identity.
    dependency_version = _dependency_version(lock_hash)
    dependencies = output / "runtimes" / "python-packages" / dependency_version
    backend = output / "app" / "backend" / version
    _safe_empty(dependencies, output)
    _safe_empty(backend, output)

    with tempfile.TemporaryDirectory(prefix="ugsci-python-layers-") as temporary:
        temporary_root = Path(temporary)
        wheels = temporary_root / "wheels"
        wheels.mkdir()
        _run(
            [
                str(runtime_python),
                "-m",
                "pip",
                "install",
                "--disable-pip-version-check",
                "--no-input",
                "--requirement",
                str(lock),
                "--require-hashes",
                "--target",
                str(dependencies),
            ],
            cwd=repo,
        )
        _run(
            [
                str(host_python),
                "-m",
                "build",
                "--wheel",
                "--outdir",
                str(wheels),
            ],
            cwd=repo,
        )
        wheel_candidates = sorted(wheels.glob("qwenpaw-*.whl"))
        if len(wheel_candidates) != 1:
            raise RuntimeError(f"expected one QwenPaw wheel, found {wheel_candidates}")
        wheel = wheel_candidates[0]
        _run(
            [
                str(runtime_python),
                "-m",
                "pip",
                "install",
                "--disable-pip-version-check",
                "--no-input",
                "--no-deps",
                "--target",
                str(backend),
                str(wheel),
            ],
            cwd=repo,
        )

        environment = dict(os.environ)
        environment["PYTHONNOUSERSITE"] = "1"
        environment["PYTHONPATH"] = os.pathsep.join(
            (str(backend), str(dependencies)),
        )
        _run(
            [
                str(runtime_python),
                "-c",
                (
                    "import qwenpaw, qwenpaw.tauri.entry; "
                    "print(qwenpaw.__file__)"
                ),
            ],
            cwd=repo,
            env=environment,
        )
        metadata = {
            "schemaVersion": 1,
            "backendVersion": version,
            "backendWheel": wheel.name,
            "backendWheelSha256": _sha256(wheel),
            "dependencyVersion": dependency_version,
            "desktopRequirementsSha256": lock_hash,
        }

    (backend / ".ugsci-component.json").write_text(
        json.dumps(metadata, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (dependencies / ".ugsci-component.json").write_text(
        json.dumps(metadata, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return metadata


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--host-python", type=Path, required=True)
    parser.add_argument("--runtime-python", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--version", required=True)
    args = parser.parse_args()
    metadata = build_layers(
        args.repo.resolve(),
        # Do not resolve the host interpreter symlink.  On macOS a virtual
        # environment's ``bin/python`` commonly points at the framework
        # interpreter; resolving it discards the venv context and makes
        # build-time modules installed into that venv (notably ``build``)
        # invisible.
        args.host_python.absolute(),
        args.runtime_python.resolve(),
        args.output.resolve(),
        args.version.strip(),
    )
    print(json.dumps(metadata, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
