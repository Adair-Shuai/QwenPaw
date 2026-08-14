# -*- coding: utf-8 -*-
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "scripts/pack-tauri/windows_migration_bridge.cs"
BUILD = ROOT / "scripts/pack-tauri/build_windows_migration_bridge.ps1"


def test_b5_migration_bridge_hands_overlay_to_visible_assistant():
    source = SOURCE.read_text(encoding="utf-8")
    build = BUILD.read_text(encoding="utf-8")

    assert 'FooterMagic = "UGSCIBRIDGEV1!!!"' in source
    assert "ExtractOverlay(ownPath, package, out expectedHash)" in source
    assert "ExtractAssistant(package, assistant)" in source
    assert '" --parent-pid " + Process.GetCurrentProcess().Id' in source
    assert "if (File.Exists(ready)) return 0" in source
    assert "UGSciUpdateAssistant.exe" in source
    assert (
        "payload/binaries/update-assistant/UGSciUpdateAssistant.exe" in source
    )
    assert "SHA256" in source
    assert "UGSCIBRIDGEV1!!!" in build
    assert "pnpm exec tauri signer sign $MigrationBridge" in (
        ROOT / "scripts/pack-tauri/build_win_pyinstaller.ps1"
    ).read_text(encoding="utf-8")
