# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
"""One-shot: append the _full_zip link-check-order guard."""
from pathlib import Path

p = Path("tests/unit/tauri/test_component_artifacts.py")
text = p.read_text(encoding="utf-8")
assert "test_full_zip_rejects_links_before_file_filter" not in text

guard = '''

def test_full_zip_rejects_links_before_file_filter():
    """Guard: _full_zip must check is_symlink BEFORE the is_file filter.

    A dangling symlink reports is_file() == False, so checking after the
    filter would silently skip it. The order must match
    component_common.iter_files (symlink check first).
    """
    import inspect as _inspect

    builder = _load("build_component_release")
    source = _inspect.getsource(builder._full_zip)
    sym_pos = source.find("is_symlink")
    file_pos = source.find("is_file")
    assert sym_pos != -1, "_full_zip must reject symlinks"
    assert file_pos != -1
    assert sym_pos < file_pos, (
        "symlink check must precede the is_file filter so dangling links "
        "are rejected instead of silently skipped"
    )
'''

p.write_text(text.rstrip("\n") + "\n" + guard, encoding="utf-8", newline="\n")
print(
    "appended:",
    "test_full_zip_rejects_links" in p.read_text(encoding="utf-8"),
)
