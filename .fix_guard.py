# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
from pathlib import Path

p = Path("tests/unit/tauri/test_component_artifacts.py")
t = p.read_text(encoding="utf-8")
old = """    sym_pos = source.find("is_symlink")
    file_pos = source.find("is_file")"""
new = """    # Match the code forms, not the words in comments.
    sym_pos = source.find("path.is_symlink()")
    file_pos = source.find("path.is_file()")"""
assert old in t
p.write_text(t.replace(old, new), encoding="utf-8", newline="\n")
print("fixed")
