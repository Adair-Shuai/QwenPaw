# -*- coding: utf-8 -*-
"""Identity of desktop code that component ZIPs cannot replace.

Keep the input list and byte framing in sync with src-tauri/build.rs.
Text newlines are normalized so Windows and macOS builds agree.
"""

import hashlib
from pathlib import Path

HOST_INPUTS = (
    "console/src-tauri/src",
    "console/src-tauri/build.rs",
    "console/src-tauri/Cargo.toml",
    "console/src-tauri/Cargo.lock",
    "console/src-tauri/capabilities",
    "console/src-tauri/permissions",
    "scripts/pack/assets/icon.svg",
    "scripts/pack-tauri/windows_update_assistant.cs",
    "scripts/pack-tauri/build_windows_update_assistant.ps1",
    "console/src-tauri/nsis",
    "console/src-tauri/nsis-hooks.nsh",
    "console/src-tauri/nsis-languages",
    "console/src-tauri/vite.bootstrap.config.ts",
    "console/buildVersion.ts",
    "console/src-tauri/tauri.conf.json",
    "console/src",
    "console/package.json",
    "console/package-lock.json",
    "console/tauri.html",
    "console/vite.config.ts",
)


def host_fingerprint(root: Path) -> str:
    paths = []
    for name in HOST_INPUTS:
        path = root / name
        if path.is_dir():
            paths.extend(p for p in path.rglob("*") if p.is_file())
        else:
            paths.append(path)
    digest = hashlib.sha256()
    for path in sorted(paths, key=lambda p: p.relative_to(root).as_posix()):
        if not path.is_file():
            continue
        digest.update(path.relative_to(root).as_posix().encode())
        digest.update(b"\0")
        digest.update(path.read_bytes().replace(b"\r\n", b"\n"))
        digest.update(b"\0")
    return digest.hexdigest()
