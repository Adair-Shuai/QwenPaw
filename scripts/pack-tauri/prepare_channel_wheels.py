#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the readable channel wheelhouse without the legacy full environment."""

from __future__ import annotations

import argparse
from pathlib import Path
import subprocess


def prepare_channel_wheels(
    repo: Path,
    python: Path,
    wheelhouse: Path,
) -> Path:
    """Resolve real wheels for the target ABI and return the host wheel."""
    repo = repo.resolve(strict=True)
    wheelhouse.mkdir(parents=True, exist_ok=True)
    if any(wheelhouse.iterdir()):
        raise ValueError("Channel wheelhouse must be empty")
    subprocess.run(
        [
            str(python),
            "-m",
            "pip",
            "wheel",
            "--prefer-binary",
            "--wheel-dir",
            str(wheelhouse.resolve()),
            ".[channels]",
            # lark-oapi still uses pkg_resources at import time.
            "setuptools<82",
            "--requirement",
            str(repo / "scripts/pack-tauri/native-host-requirements.txt"),
        ],
        cwd=repo,
        check=True,
    )
    hosts = list(wheelhouse.glob("qwenpaw-*.whl"))
    if len(hosts) != 1:
        raise ValueError("Expected one QwenPaw host wheel")
    return hosts[0]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--python", type=Path, required=True)
    parser.add_argument("--wheelhouse", type=Path, required=True)
    print(prepare_channel_wheels(**vars(parser.parse_args())))


if __name__ == "__main__":
    main()
