#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vendor the pinned Data context console through its existing build script."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

DATA_REPOSITORY = "https://github.com/agentscope-ai/QwenPaw-Data.git"
DATA_REF = "v0.3.3"


def prepare(repo: Path) -> None:
    """Use an explicit local checkout or an isolated pinned source checkout."""
    repo = repo.resolve(strict=True)
    script = repo / "plugins/apps/qwenpaw-data/scripts/sync-context-ui.sh"
    if not script.is_file():
        raise FileNotFoundError(script)
    configured = os.environ.get("QWENPAW_DATA_SOURCE_DIR")
    with tempfile.TemporaryDirectory(
        prefix="qwenpaw-data-context-build-",
    ) as temporary:
        source = (
            Path(configured).expanduser().resolve()
            if configured
            else Path(temporary) / "source"
        )
        if not configured:
            subprocess.run(
                [
                    "git",
                    "clone",
                    "--depth",
                    "1",
                    "--branch",
                    DATA_REF,
                    DATA_REPOSITORY,
                    str(source),
                ],
                check=True,
            )
        if not (
            source / "packages/qwenpaw-data-context/frontend/package.json"
        ).is_file():
            raise ValueError(
                "Data context console source checkout is incomplete",
            )
        environment = dict(os.environ)
        # Git Bash accepts forward-slash Windows drive paths too.
        environment["QWENPAW_DATA_SOURCE_DIR"] = source.as_posix()
        shell = "bash"
        if os.name == "nt":
            git = shutil.which("git")
            candidate = (
                Path(git).parent.parent / "bin/bash.exe" if git else None
            )
            if candidate is None or not candidate.is_file():
                raise ValueError(
                    "Git Bash is required to build the Data context console",
                )
            shell = str(candidate)
        subprocess.run(
            [shell, script.as_posix()],
            cwd=repo,
            env=environment,
            check=True,
        )
        target = (
            repo
            / "plugins/apps/qwenpaw-data/ui/public/context-console/index.html"
        )
        if not target.is_file() or not target.stat().st_size:
            raise ValueError(
                "Data context console build did not produce index.html",
            )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, required=True)
    prepare(parser.parse_args().repo)


if __name__ == "__main__":
    main()
