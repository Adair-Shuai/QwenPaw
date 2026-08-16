# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
"""One-shot: append the P0-2 AST guard to test_plugin_startup_order.py."""
from pathlib import Path

p = Path("tests/unit/app/test_plugin_startup_order.py")
t = p.read_text(encoding="utf-8")
assert "test_directory_components_skip" not in t

guard = '''

def test_directory_components_skip_plugin_health_check_rollback() -> None:
    """P0-2 guard: directory components must be skipped in the health loop.

    A directory component (backend, runtimes) is not a plugin, so
    ``loaded_plugins.get(id)`` is always None. Without the skip, the health
    check would "roll back" every successfully updated directory component,
    find no previous tree, and delete its freshly committed active.json
    record -- permanently breaking updates for that component. This scans the
    health-check loop and requires the ``is_directory_component`` guard to
    appear before the rollback call.
    """
    startup = _background_startup_node()
    loop_lines = {
        "guard": [],
        "rollback": [],
    }
    for node in ast.walk(startup):
        if not isinstance(node, ast.Call):
            continue
        func = node.func
        attr = func.attr if isinstance(func, ast.Attribute) else None
        if attr == "is_directory_component":
            loop_lines["guard"].append(node.lineno)
        elif attr == "rollback_activation":
            loop_lines["rollback"].append(node.lineno)
    assert loop_lines["rollback"], (
        "rollback_activation call not found in _background_startup"
    )
    assert loop_lines["guard"], (
        "health-check loop must skip directory components via "
        "is_directory_component before any rollback (P0-2 regression)"
    )
    assert min(loop_lines["guard"]) < max(loop_lines["rollback"]), (
        "the is_directory_component skip must precede the rollback call"
    )
'''

p.write_text(t.rstrip("\n") + "\n" + guard, encoding="utf-8", newline="\n")
print(
    "appended:",
    "test_directory_components_skip" in p.read_text(encoding="utf-8"),
)
