# -*- coding: utf-8 -*-
"""Regression guards for the portable Windows pywin32 bootstrap."""

from pathlib import Path
import sys

import pytest


REPO_ROOT = Path(__file__).resolve().parents[3]
WIN32_PTH_MODULE = REPO_ROOT / "src" / "qwenpaw" / "_win32_pth.py"
PACKAGE_INIT = REPO_ROOT / "src" / "qwenpaw" / "__init__.py"


def test_package_init_contains_pywin32_pth_bootstrap() -> None:
    module_source = WIN32_PTH_MODULE.read_text(encoding="utf-8")
    init_source = PACKAGE_INIT.read_text(encoding="utf-8")

    assert "bootstrap_windows_pth_dirs" in module_source
    assert "_ensure_mcp_types_bound()" in module_source
    assert "setattr(mcp_module, \"types\", types_module)" in module_source
    assert "pywin32.pth" in module_source
    assert "_process_pth_file(entry, pth)" in module_source
    assert 'stripped.startswith("import ")' in module_source
    assert (
        "from ._win32_pth import bootstrap_windows_pth_dirs"
        in init_source
    )
    assert "bootstrap_windows_pth_dirs()" in init_source


@pytest.mark.skipif(sys.platform != "win32", reason="pywin32 is Windows-only")
def test_bootstrap_processes_pywin32_pth(tmp_path: Path) -> None:
    deps = tmp_path / "python-packages"
    (deps / "win32" / "lib").mkdir(parents=True)
    (deps / "pythonwin").mkdir(parents=True)
    (deps / "pywin32.pth").write_text(
        "win32\nwin32\\lib\npythonwin\n",
        encoding="utf-8",
    )
    original = list(sys.path)
    try:
        from qwenpaw._win32_pth import _process_pth_file

        _process_pth_file(str(deps), str(deps / "pywin32.pth"))
        resolved = [Path(item).resolve() for item in sys.path]
        assert Path(deps / "win32").resolve() in resolved
        assert Path(deps / "win32" / "lib").resolve() in resolved
        assert Path(deps / "pythonwin").resolve() in resolved
    finally:
        sys.path[:] = original
        sys.modules.pop("qwenpaw._win32_pth", None)
