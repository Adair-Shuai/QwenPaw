# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
from pathlib import Path

# Fix 1: client guard needs parent dir created before lease mkdir
pc = Path("tests/unit/tauri/test_component_client.py")
tc = pc.read_text(encoding="utf-8")
old1 = """    root = downloader.cache_root / "artifacts" / "abc"
    lease = root / ".download.lock"
    part = root / "a.zip.part"
    # Process A acquires.
    token_a = downloader._acquire_download_lease(lease, part)"""
new1 = """    root = downloader.cache_root / "artifacts" / "abc"
    root.mkdir(parents=True)
    lease = root / ".download.lock"
    part = root / "a.zip.part"
    # Process A acquires.
    token_a = downloader._acquire_download_lease(lease, part)"""
assert old1 in tc
pc.write_text(tc.replace(old1, new1), encoding="utf-8", newline="\n")

# Fix 2: the lock lives in _install (the thin _install_from_manifest wraps it)
ps = Path("tests/unit/tauri/test_component_service.py")
ts = ps.read_text(encoding="utf-8")
old2 = "    source = inspect.getsource(svc.ComponentUpdateService._install_from_manifest)"
new2 = "    source = inspect.getsource(svc.ComponentUpdateService._install)"
assert old2 in ts
ps.write_text(ts.replace(old2, new2), encoding="utf-8", newline="\n")
print("fixed")
