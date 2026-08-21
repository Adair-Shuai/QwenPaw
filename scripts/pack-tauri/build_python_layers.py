#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build independently versioned Python dependency and QwenPaw backend layers."""

from __future__ import annotations

import argparse
from collections.abc import Iterator
from contextlib import contextmanager
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

try:
    from copy_windows_tree import copy_tree, remove_tree
except ModuleNotFoundError:
    _helper_spec = importlib.util.spec_from_file_location(
        "qwenpaw_copy_windows_tree",
        Path(__file__).with_name("copy_windows_tree.py"),
    )
    if _helper_spec is None or _helper_spec.loader is None:
        raise
    _helper = importlib.util.module_from_spec(_helper_spec)
    _helper_spec.loader.exec_module(_helper)
    copy_tree = _helper.copy_tree
    remove_tree = _helper.remove_tree


def _run(
    command: list[str],
    *,
    cwd: Path,
    env: dict[str, str] | None = None,
) -> None:
    subprocess.run(command, cwd=cwd, env=env, check=True)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _dependency_version(lock_hash: str) -> str:
    """Return a stable PEP 440 version for a dependency lock digest."""
    if len(lock_hash) < 16 or any(
        char not in "0123456789abcdef" for char in lock_hash
    ):
        raise ValueError(
            "desktop requirements digest must be lowercase SHA-256",
        )
    return f"0+sha.{lock_hash[:16]}"


# Windows Explorer extraction is capped at MAX_PATH (~260). The portable
# ZIP is commonly unpacked under Downloads\\<archive-name>\\, which already
# consumes ~80 characters. Keep payload-relative paths under this budget so
# Setup.exe does not report "Package file is missing" for files Explorer
# silently dropped.
MAX_PORTABLE_RELATIVE_PATH = 180
_PYTHON_PACKAGES_PAYLOAD_PREFIX = "payload/binaries/runtimes/python-packages"

# UGSci only uses modelscope.hub for snapshot downloads. The dataset class
# tree ships nested names such as
# image_quality_assessment_degradation_dataset.py that break Windows
# extraction when the ZIP is unpacked to a typical Downloads folder.
_UNUSED_DEPENDENCY_TREES = (
    ("jedi", "third_party", "typeshed", "stubs", "oauthlib"),
    ("lark_oapi", "api", "security_and_compliance"),
    ("modelscope", "msdatasets"),
    ("twilio", "rest", "api", "v2010", "account", "sip"),
)
_GENERATED_DEPENDENCY_DIRECTORIES = {"__pycache__"}
_GENERATED_DEPENDENCY_SUFFIXES = (".dSYM",)


def prune_python_packages(root: Path) -> list[str]:
    """Remove unused or reproducible generated trees from the runtime layer."""
    removed: list[str] = []
    for parts in _UNUSED_DEPENDENCY_TREES:
        target = root.joinpath(*parts)
        if target.is_dir():
            remove_tree(target)
            removed.append("/".join(parts))
    for current, directories, _names in os.walk(root, topdown=True):
        directories.sort()
        for name in list(directories):
            if (
                name not in _GENERATED_DEPENDENCY_DIRECTORIES
                and not name.endswith(_GENERATED_DEPENDENCY_SUFFIXES)
            ):
                continue
            target = Path(current) / name
            remove_tree(target)
            directories.remove(name)
            removed.append(target.relative_to(root).as_posix())
    return removed


def assert_portable_relative_paths(
    root: Path,
    *,
    packaged_prefix: str,
    limit: int = MAX_PORTABLE_RELATIVE_PATH,
) -> None:
    """Fail the desktop build if any packaged relative path exceeds *limit*."""
    prefix = packaged_prefix.replace("\\", "/").strip("/")
    native_root = os.path.abspath(os.fspath(root))
    if os.name == "nt":
        if native_root.startswith("\\\\"):
            native_root = (
                native_root
                if native_root.startswith("\\\\?\\")
                else "\\\\?\\UNC\\" + native_root[2:]
            )
        else:
            native_root = (
                native_root
                if native_root.startswith("\\\\?\\")
                else "\\\\?\\" + native_root
            )
    offenders: list[str] = []
    walk_errors: list[OSError] = []
    for current, _directories, names in os.walk(
        native_root,
        onerror=walk_errors.append,
    ):
        for name in names:
            source = os.path.join(current, name)
            relative = os.path.relpath(source, native_root).replace("\\", "/")
            packaged = f"{prefix}/{relative}"
            if len(packaged) > limit:
                offenders.append(f"{len(packaged)}:{packaged}")
    if walk_errors:
        raise walk_errors[0]
    if offenders:
        preview = "; ".join(sorted(offenders, reverse=True)[:8])
        raise RuntimeError(
            f"python-packages contains paths over {limit} characters; "
            f"Windows Explorer will drop them during Setup extraction: "
            f"{preview}",
        )


def _safe_empty(path: Path, parent: Path) -> None:
    resolved = path.resolve()
    root = parent.resolve()
    if resolved == root or root not in resolved.parents:
        raise ValueError(
            f"refusing to replace layer outside {root}: {resolved}",
        )
    if resolved.exists():
        remove_tree(resolved)
    resolved.mkdir(parents=True)


@contextmanager
def _staged_console(repo: Path) -> Iterator[None]:
    """Temporarily expose the built console to setuptools without dirtying src."""
    console_dist = repo / "console" / "dist"
    if not (console_dist / "index.html").is_file():
        raise FileNotFoundError(
            f"built console is missing index.html: {console_dist / 'index.html'}",
        )
    console_dest = repo / "src" / "qwenpaw" / "console"
    package_root = (repo / "src" / "qwenpaw").resolve()
    resolved_destination = console_dest.resolve()
    if (
        resolved_destination == package_root
        or package_root not in resolved_destination.parents
    ):
        raise ValueError(
            f"invalid packaged console destination: {console_dest}",
        )

    with tempfile.TemporaryDirectory(
        prefix=".ugsci-console-backup-",
        dir=repo,
    ) as temporary:
        backup = Path(temporary) / "console"
        had_existing = console_dest.exists()
        if had_existing:
            shutil.move(str(console_dest), str(backup))
        try:
            if os.name == "nt":
                copy_tree(console_dist, console_dest)
            else:
                shutil.copytree(console_dist, console_dest)
            yield
        finally:
            if console_dest.exists():
                remove_tree(console_dest)
            if had_existing:
                shutil.move(str(backup), str(console_dest))


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
        raise FileNotFoundError(
            f"standalone Python is missing: {runtime_python}",
        )

    lock_hash = _sha256(lock)
    # Component versions are parsed with packaging.version.Version at runtime.
    # A raw digest may begin with a letter, so encode it as valid PEP 440 local
    # version metadata while retaining a stable content-derived identity.
    dependency_version = _dependency_version(lock_hash)
    dependencies = output / "runtimes" / "python-packages" / dependency_version
    backend = output / "app" / "backend" / version
    _safe_empty(dependencies, output)
    _safe_empty(backend, output)

    with tempfile.TemporaryDirectory(
        prefix="ugsci-python-layers-",
    ) as temporary:
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
        prune_python_packages(dependencies)
        assert_portable_relative_paths(
            dependencies,
            packaged_prefix=(
                f"{_PYTHON_PACKAGES_PAYLOAD_PREFIX}/{dependency_version}"
            ),
        )
        with _staged_console(repo):
            _run(
                [
                    str(host_python),
                    "-m",
                    "build",
                    "--wheel",
                    "--no-isolation",
                    "--outdir",
                    str(wheels),
                ],
                cwd=repo,
            )
        wheel_candidates = sorted(wheels.glob("qwenpaw-*.whl"))
        if len(wheel_candidates) != 1:
            raise RuntimeError(
                f"expected one QwenPaw wheel, found {wheel_candidates}",
            )
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
        packaged_console = backend / "qwenpaw" / "console" / "index.html"
        if not packaged_console.is_file():
            raise RuntimeError(
                f"backend wheel does not contain the console: {packaged_console}",
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
                    "import importlib, qwenpaw, qwenpaw.tauri.entry; "
                    "importlib.import_module('modelscope.hub.api'); "
                    "print(qwenpaw.__file__)"
                ),
            ],
            cwd=repo,
            env=environment,
        )
        backend_metadata = {
            "schemaVersion": 1,
            "backendVersion": version,
            "backendWheel": wheel.name,
            "backendWheelSha256": _sha256(wheel),
            "dependencyVersion": dependency_version,
            "desktopRequirementsSha256": lock_hash,
        }
        dependency_metadata = {
            "schemaVersion": 2,
            "dependencyVersion": dependency_version,
            "desktopRequirementsSha256": lock_hash,
        }

    (backend / ".ugsci-component.json").write_text(
        json.dumps(backend_metadata, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    (dependencies / ".ugsci-component.json").write_text(
        json.dumps(dependency_metadata, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return backend_metadata


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
