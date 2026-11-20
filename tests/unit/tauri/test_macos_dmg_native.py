# -*- coding: utf-8 -*-
"""Create, mount and drag-copy a real signed bundle on macOS."""

import importlib.util
from pathlib import Path
import plistlib
import shutil
import sys

import pytest

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location(
    "ugsci_macos_dmg_native",
    ROOT / "scripts/pack-tauri/macos_dmg.py",
)
assert SPEC is not None and SPEC.loader is not None
DMG = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DMG)
pytestmark = pytest.mark.skipif(
    sys.platform != "darwin",
    reason="Requires hdiutil, Finder metadata and codesign",
)


def test_real_dmg_preserves_signed_payload_layout_and_drag_copy(
    tmp_path,
    monkeypatch,
):
    for name in list(DMG.os.environ):
        if name.startswith("APPLE_") or name.startswith("QWENPAW_REQUIRE_"):
            monkeypatch.delenv(name)
    app = tmp_path / "UGSci.app"
    resources = app / "Contents/Resources"
    resources.mkdir(parents=True)
    executable = app / "Contents/MacOS/UGSci"
    executable.parent.mkdir()
    shutil.copy2("/usr/bin/true", executable)
    shutil.copy2(DMG.ASSETS / "icon.icns", resources / "icon.icns")
    (resources / "用户数据.txt").write_text(
        "preserve payload",
        encoding="utf-8",
    )
    (resources / "empty").mkdir()
    (resources / "link").symlink_to("用户数据.txt")
    (app / "Contents/Info.plist").write_bytes(
        plistlib.dumps(
            {
                "CFBundleName": "UGSci",
                "CFBundleExecutable": "UGSci",
                "CFBundleVersion": "1.0",
                "CFBundleIdentifier": "io.ugsci.dmg.fixture",
                "CFBundlePackageType": "APPL",
                "CFBundleIconFile": "icon.icns",
            },
        ),
    )
    DMG.run_tool(["codesign", "--force", "--deep", "--sign", "-", str(app)])
    original = DMG.app_inventory(app)
    dmg = tmp_path / "UGSci.dmg"
    DMG.build(app, dmg)
    DMG.verify_dmg(dmg, app)
    copied = DMG.install_for_verification(dmg, tmp_path / "installed")
    assert DMG.app_inventory(copied) == original
    with DMG.mounted(dmg) as volume:
        assert (volume / "应用程序").readlink() == Path("/Applications")
        DMG.verify_layout(volume)
        DMG.verify_background(volume)
