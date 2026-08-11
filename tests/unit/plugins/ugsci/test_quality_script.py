from __future__ import annotations

from pathlib import Path

from scripts.check_ugsci_quality import default_source_files, main


def test_quality_script_discovers_canonical_sources_by_default() -> None:
    files = default_source_files()
    assert files
    assert (
        Path("plugins/bundle/ugsci/domain/storage_inventory/adapters.py").resolve()
        in files
    )
    assert not any("\\skills\\" in str(path) or "/skills/" in str(path) for path in files)


def test_quality_script_without_arguments_performs_a_real_check() -> None:
    assert main([]) == 0
