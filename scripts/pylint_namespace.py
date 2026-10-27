# -*- coding: utf-8 -*-
"""Keep namespace plugin modules distinct without changing Pylint checks."""

from __future__ import annotations

from collections.abc import Sequence
from importlib.machinery import PathFinder
from pathlib import Path
import subprocess
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


PROJECT_ROOTS = (
    Path("COMSOL_Multiphysics_MCP/COMSOL_Multiphysics_MCP-main"),
    Path("plugins/apps/qwenpaw-creator/backend"),
)


def module_target(
    filename: str,
    root: Path,
    *,
    search_roots: Sequence[Path] | None = None,
    source_layout: bool = True,
) -> str:
    """Use a qualified name only when it resolves to the exact input file."""
    path = Path(filename)
    path = (path if path.is_absolute() else root / path).resolve()
    try:
        relative = path.relative_to(root)
    except ValueError:
        return filename
    # Keep the explicit __init__ suffix: passing the package name itself
    # would recursively analyze files outside pre-commit's selected set.
    if relative.suffix != ".py":
        return filename
    if source_layout and relative.parts[0] == "src":
        relative = relative.relative_to("src")
    name = ".".join(relative.with_suffix("").parts)
    origin = module_origin(name, search_roots or (root / "src", root))
    if origin is None or origin.resolve() != path:
        return filename
    return name


def project_root(filename: str, root: Path) -> Path:
    """Resolve standalone projects with their own top-level import names."""
    path = (root / filename).resolve()
    for relative in PROJECT_ROOTS:
        candidate = (root / relative).resolve()
        if path.is_relative_to(candidate):
            return candidate
    return root


def run_linter(
    options: Sequence[str],
    files: Sequence[str],
    root: Path,
    project: Path,
) -> int:
    """Analyze only selected modules in one independent import context."""
    roots = [root / "src", root]
    if project != root:
        roots.insert(0, project)
    targets = [
        module_target(
            str((root / filename).resolve()) if project != root else filename,
            project,
            search_roots=roots,
            source_layout=project == root,
        )
        for filename in files
    ]
    original_path = sys.path[:]
    try:
        sys.path[:0] = [str(path) for path in roots]
        from pylint.lint import Run

        return Run([*options, "--", *targets], exit=False).linter.msg_status
    finally:
        sys.path[:] = original_path


def main(argv: Sequence[str] | None = None) -> int:
    """Forward every original option, selected file and exit status."""
    arguments = list(sys.argv[1:] if argv is None else argv)
    root = Path(__file__).resolve().parents[1]
    project = None
    if arguments and arguments[0].startswith("--project-root="):
        project = Path(arguments.pop(0).split("=", 1)[1]).resolve()
        allowed = {root, *(root / path for path in PROJECT_ROOTS)}
        if project not in allowed:
            print("Unknown project import context", file=sys.stderr)
            return 2
    if "--" not in arguments:
        print("Separate Pylint options and filenames with --", file=sys.stderr)
        return 2
    separator = arguments.index("--")
    options, files = arguments[:separator], arguments[separator + 1 :]
    if project is not None:
        return run_linter(options, files, root, project)
    groups: dict[Path, list[str]] = {}
    for filename in files:
        groups.setdefault(project_root(filename, root), []).append(filename)
    if not groups or tuple(groups) == (root,):
        return run_linter(options, files, root, root)
    # Astroid caches modules by import name. Independent processes are
    # necessary when embedded projects each own names such as src/scripts.
    status = 0
    for context, selected in groups.items():
        result = subprocess.run(
            [
                sys.executable,
                str(Path(__file__).resolve()),
                f"--project-root={context}",
                *options,
                "--",
                *selected,
            ],
            check=False,
        )
        status |= result.returncode
    return status


if __name__ == "__main__":
    raise SystemExit(main())
