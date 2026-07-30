#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fast, dependency-free quality checks for canonical UGSci Python sources."""

from __future__ import annotations

import ast
import sys
from pathlib import Path


def check_file(path: Path) -> list[str]:
    """Return human-readable syntax and whitespace violations."""
    errors: list[str] = []
    raw = path.read_bytes()
    if b"\r\n" in raw:
        errors.append(f"{path}: CRLF line endings are not allowed")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        return [f"{path}: invalid UTF-8: {exc}"]
    for line_number, line in enumerate(text.splitlines(), start=1):
        if line.rstrip(" \t") != line:
            errors.append(f"{path}:{line_number}: trailing whitespace")
    try:
        ast.parse(text, filename=str(path))
    except SyntaxError as exc:
        errors.append(
            f"{path}:{exc.lineno or 1}: syntax error: {exc.msg}",
        )
    return errors


def main(arguments: list[str]) -> int:
    errors = [
        error for argument in arguments for error in check_file(Path(argument))
    ]
    if errors:
        print("\n".join(errors))
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
