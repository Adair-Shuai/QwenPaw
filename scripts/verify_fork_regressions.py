# -*- coding: utf-8 -*-
"""Fixed backend inventory for UGSci features retained across upstream merges."""

import argparse
import ast
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = Path(__file__).with_name("fork_backend_suites.json")


def verify_inventory(root=ROOT, inventory=None):
    inventory = inventory or json.loads(INVENTORY.read_text(encoding="utf-8"))
    suites = list(
        dict.fromkeys(
            name for group in inventory["groups"].values() for name in group
        ),
    )
    if not suites:
        raise ValueError("Fork backend regression inventory is empty")
    if set(inventory.get("required_cases", {})) - set(suites):
        raise ValueError(
            "A protected backend suite was removed from the execution inventory",
        )
    for name in suites:
        path = root / name
        if not path.is_file():
            raise ValueError(f"Required fork backend suite missing: {name}")
        tree = ast.parse(path.read_text(encoding="utf-8-sig"))
        cases = {
            node.name: node
            for node in ast.walk(tree)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
            and node.name.startswith("test_")
        }
        if not cases:
            raise ValueError(f"No executable fork backend tests: {name}")
        for case in inventory.get("required_cases", {}).get(name, []):
            if case not in cases:
                raise ValueError(
                    f"Required fork backend case missing: {name}: {case}",
                )
            node = cases[case]
            # Decorators on a containing class/module also affect collection.
            affected = [
                node,
                *[
                    parent
                    for parent in ast.walk(tree)
                    if isinstance(parent, ast.ClassDef)
                    and node in list(ast.walk(parent))
                ],
            ]
            expressions = [
                decorator
                for parent in affected
                for decorator in parent.decorator_list
            ]
            expressions += [
                item
                for item in tree.body
                if isinstance(item, (ast.Assign, ast.AnnAssign))
                and "pytestmark" in ast.unparse(item).split("=", 1)[0]
            ]
            if any(
                isinstance(part, ast.Attribute)
                and part.attr in {"skip", "skipif", "xfail"}
                for item in expressions
                for part in ast.walk(item)
            ):
                raise ValueError(
                    f"Protected fork backend case cannot be skipped: {case}",
                )
            body = [
                item
                for item in node.body
                if not (
                    isinstance(item, ast.Expr)
                    and isinstance(item.value, ast.Constant)
                    and isinstance(item.value.value, str)
                )
            ]
            if not body or all(
                isinstance(item, (ast.Pass, ast.Return)) for item in body
            ):
                raise ValueError(f"Empty protected fork backend case: {case}")
            if any(
                isinstance(item, ast.Call)
                and isinstance(item.func, ast.Attribute)
                and isinstance(item.func.value, ast.Name)
                and item.func.value.id == "pytest"
                and item.func.attr in {"skip", "importorskip", "xfail"}
                for item in ast.walk(node)
            ):
                raise ValueError(
                    f"Protected fork backend case cannot skip at runtime: {case}",
                )
    return suites


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    suites = verify_inventory()
    print(
        f"Fork backend inventory verified: {len(suites)} suites.",
        flush=True,
    )
    if args.check:
        return 0
    return subprocess.call(
        [
            sys.executable,
            "-m",
            "pytest",
            *suites,
            "-q",
            "-p",
            "no:cacheprovider",
        ],
        cwd=ROOT,
    )


if __name__ == "__main__":
    raise SystemExit(main())
