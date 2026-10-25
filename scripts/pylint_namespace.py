# -*- coding: utf-8 -*-
"""Keep namespace plugin modules distinct without changing Pylint checks."""

from __future__ import annotations

from collections.abc import Sequence
from importlib.machinery import PathFinder
from pathlib import Path
import sys


def module_origin(name: str, roots: Sequence[Path]) -> Path | None:
    """Locate source without executing any package initializer."""
    search = [str(root) for root in roots]
    parts = name.split(".")
    for index, part in enumerate(parts):
        if not part:
            return None
        spec = PathFinder.find_spec(part, search)
        if spec is None:
            return None
        if index == len(parts) - 1:
            return Path(spec.origin) if spec.origin else None
        if spec.submodule_search_locations is None:
            return None
        search = list(spec.submodule_search_locations)
    return None


def module_target(filename: str, root: Path) -> str:
    """Use a qualified name only when it resolves to the exact input file."""
    path = Path(filename)
    path = (path if path.is_absolute() else root / path).resolve()
    try:
        relative = path.relative_to(root)
    except ValueError:
        return filename
    # Keep explicit initializer files as files: passing a package name can
    # recursively analyze files outside pre-commit's selected input set.
    if relative.suffix != ".py" or relative.name == "__init__.py":
        return filename
    if relative.parts[0] == "src":
        relative = relative.relative_to("src")
    name = ".".join(relative.with_suffix("").parts)
    origin = module_origin(name, (root / "src", root))
    if origin is None or origin.resolve() != path:
        return filename
    return name


def main(argv: Sequence[str] | None = None) -> int:
    """Forward every original option, selected file and exit status."""
    arguments = list(sys.argv[1:] if argv is None else argv)
    if "--" not in arguments:
        print("Separate Pylint options and filenames with --", file=sys.stderr)
        return 2
    separator = arguments.index("--")
    options, files = arguments[:separator], arguments[separator + 1 :]
    root = Path(__file__).resolve().parents[1]
    targets = [module_target(filename, root) for filename in files]
    original_path = sys.path[:]
    try:
        sys.path[:0] = [str(root / "src"), str(root)]
        from pylint.lint import Run

        return Run([*options, "--", *targets], exit=False).linter.msg_status
    finally:
        sys.path[:] = original_path


if __name__ == "__main__":
    raise SystemExit(main())
