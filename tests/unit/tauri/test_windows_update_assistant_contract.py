# -*- coding: utf-8 -*-
"""Contracts for the visible Windows desktop update hand-off."""

import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
SOURCE = REPO_ROOT / "scripts" / "pack-tauri" / "windows_update_assistant.cs"
BUILD = (
    REPO_ROOT
    / "scripts"
    / "pack-tauri"
    / "build_windows_update_assistant.ps1"
)


def test_update_assistant_is_bundled_and_built_before_tauri() -> None:
    config = json.loads(
        (REPO_ROOT / "console" / "src-tauri" / "tauri.conf.json").read_text(
            encoding="utf-8",
        ),
    )
    build = (
        REPO_ROOT
        / "scripts"
        / "pack-tauri"
        / "build_win_pyinstaller.ps1"
    ).read_text(encoding="utf-8")

    assert "binaries" in config["bundle"]["resources"]
    assert "build_windows_update_assistant.ps1" in build
    assert build.index("build_windows_update_assistant.ps1") < build.index(
        "pnpm exec tauri build",
    )
    assert BUILD.is_file()


def test_layered_windows_build_skips_monolithic_nsis_bundle() -> None:
    build = (
        REPO_ROOT
        / "scripts"
        / "pack-tauri"
        / "build_win_pyinstaller.ps1"
    ).read_text(encoding="utf-8")

    assert '$env:QWENPAW_LAYERED_DESKTOP -match "^(1|true|yes)$"' in build
    assert (
        "pnpm exec tauri build --no-bundle "
        "--config src-tauri/tauri.version.conf.json"
    ) in build


def test_assistant_covers_visible_handoff_and_safe_install_stages() -> None:
    source = SOURCE.read_text(encoding="utf-8")

    assert 'Shown += delegate { SignalReadyAndStart(); };' in source
    assert 'File.WriteAllText(options.ReadyFile' in source
    assert '"Local\\\\UGSciDesktopUpdateAssistant"' in source
    assert (
        'VerifySha256(options.PackagePath, options.ExpectedSha256)' in source
    )
    assert "ExtractSafely(options.PackagePath" in source
    assert "ZIP entry escapes the staging directory" in source
    assert "ZIP symbolic links are not allowed" in source
    assert "WaitForParent(options.ParentPid" in source
    assert (
        'Arguments = "--silent --deferred-commit --transaction-file "'
        in source
    )
    assert "ReadTransaction(transactionFile)" in source
    assert "RecoverInterruptedTransactions(stateRoot)" in source
    assert (
        'Directory.GetFiles(stateDirectory, "install-transaction-*.json")'
        in source
    )
    assert "WaitForStartupHealth(" in source
    assert "CommitTransaction(transaction)" in source
    assert "RollbackTransaction(transaction, launchedApplication)" in source
    assert (
        "RestorePreviousShortcuts(value, executable, value.install_dir)"
        in source
    )
    assert "RepairApplicationShortcuts(executable, location)" in source
    assert "Never leave InstallLocation empty" in source
    assert (
        "Mark the\n            // transaction committed before "
        "best-effort cleanup"
        in source
    )
    assert 'WriteJournal("rolled-back"' in source
    assert 'WriteJournal("installed"' in source
    assert 'WriteJournal("health-checked"' in source
    assert 'WriteJournal("restarted"' in source
    assert "Process.Start(new ProcessStartInfo" in source


def test_tauri_waits_for_the_visible_ready_signal_before_exit() -> None:
    updates_path = (
        REPO_ROOT / "console" / "src-tauri" / "src" / "updates.rs"
    )
    updates = updates_path.read_text(encoding="utf-8")

    assert 'join("UGSciUpdateAssistant.exe")' in updates
    assert '.arg("--ready-file")' in updates
    assert "if ready_file.is_file()" in updates
    assert "did not show its window in time" in updates
    install_body = updates.split("fn install_cached_windows", 1)[1].split(
        "fn launch_windows_update_assistant", 1,
    )[0]
    assert install_body.index(
        "launch_windows_update_assistant",
    ) < install_body.index("result?;")
    assert install_body.index("result?;") < install_body.index(
        "app.cleanup_before_exit()",
    )
