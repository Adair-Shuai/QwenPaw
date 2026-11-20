# -*- coding: utf-8 -*-
"""Check embedded expert programs in their separate import contexts."""

from collections.abc import Sequence
import os
from pathlib import Path
import subprocess
import sys

from mypy import api


EXPERT_ROOTS = (
    Path("packages/ugsci-reservoir-expert"),
    Path("scripts/expert_channel/Awsome-tools/experts/version-demo/payload"),
)


def main(argv: Sequence[str] | None = None) -> int:
    """Preserve every selected source file and all configured mypy options."""
    arguments = list(sys.argv[1:] if argv is None else argv)
    separator = arguments.index("--")
    options, files = arguments[:separator], arguments[separator + 1 :]
    root = Path.cwd()
    expert_roots = tuple(root / folder for folder in EXPERT_ROOTS)
    groups: dict[Path, list[str]] = {}
    for filename in files:
        path = (root / filename).resolve()
        context = next(
            (folder for folder in expert_roots if path.is_relative_to(folder)),
            root,
        )
        groups.setdefault(context, []).append(os.path.relpath(path, context))

    status = 0
    for context, paths in groups.items():
        if context == root:
            # Reusing pre-commit's argv avoids constructing another Windows
            # command line for the largest partition.
            stdout, stderr, code = api.run([*options, *paths])
            sys.stdout.write(stdout)
            sys.stderr.write(stderr)
            status |= code
            continue
        # Keep the same project configuration after switching import bases.
        options_for_context = list(options)
        config = root / "pyproject.toml"
        if context != root and config.is_file():
            options_for_context += ["--config-file", os.fspath(config)]
        result = subprocess.run(
            [sys.executable, "-m", "mypy", *options_for_context, *paths],
            cwd=context,
            check=False,
        )
        status |= result.returncode
    return status


if __name__ == "__main__":
    raise SystemExit(main())
