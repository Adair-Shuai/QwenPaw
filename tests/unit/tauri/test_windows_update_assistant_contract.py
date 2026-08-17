# -*- coding: utf-8 -*-
"""Contracts for the visible Windows desktop update hand-off."""

import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
SOURCE = REPO_ROOT / "scripts" / "pack-tauri" / "windows_update_assistant.cs"
BUILD = (
    REPO_ROOT / "scripts" / "pack-tauri" / "build_windows_update_assistant.ps1"
)


def test_update_assistant_is_bundled_and_built_before_tauri() -> None:
    config = json.loads(
        (REPO_ROOT / "console" / "src-tauri" / "tauri.conf.json").read_text(
            encoding="utf-8",
        ),
    )
    build = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_win_pyinstaller.ps1"
    ).read_text(encoding="utf-8")

    assert "binaries" in config["bundle"]["resources"]
    assert "build_windows_update_assistant.ps1" in build
    assert build.index("build_windows_update_assistant.ps1") < build.index(
        "pnpm exec tauri build",
    )
    assert BUILD.is_file()


def test_layered_windows_build_skips_monolithic_nsis_bundle() -> None:
    build = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_win_pyinstaller.ps1"
    ).read_text(encoding="utf-8")

    assert '$env:QWENPAW_LAYERED_DESKTOP -match "^(1|true|yes)$"' in build
    assert (
        "pnpm exec tauri build --no-bundle "
        "--config src-tauri/tauri.version.conf.json"
    ) in build


def test_assistant_covers_visible_handoff_and_safe_install_stages() -> None:
    source = SOURCE.read_text(encoding="utf-8")

    assert "Shown += delegate { SignalReadyAndStart(); };" in source
    assert "File.WriteAllText(options.ReadyFile" in source
    assert '"Local\\\\UGSciDesktopUpdateAssistant"' in source
    assert (
        "VerifySha256(options.PackagePath, options.ExpectedSha256)" in source
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
    assert "RecoverInterruptedTransactions(stateRoot, options)" in source
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
        "best-effort cleanup" in source
    )
    assert 'WriteJournal("rolled-back"' in source
    assert 'WriteJournal("installed"' in source
    assert 'WriteJournal("health-checked"' in source
    assert 'WriteJournal("restarted"' in source
    assert "Process.Start(new ProcessStartInfo" in source


def test_assistant_trusts_working_dir_markers_and_hardens_recovery() -> None:
    source = SOURCE.read_text(encoding="utf-8")

    assert (
        'Environment.GetEnvironmentVariable("QWENPAW_WORKING_DIR")' in source
    )
    assert 'Environment.GetEnvironmentVariable("COPAW_WORKING_DIR")' in source
    assert 'candidate.StartsWith("~\\\\"' in source
    assert "Path.GetFullPath(candidate)" in source
    assert 'Path.Combine(root, "cache", "startup-complete.json")' in source
    assert "FindTrustedRegisteredInstallLocation()" in source
    assert '"UGSci Desktop", "QwenPaw Desktop", "QwenPaw"' in source
    assert 'const string backupPrefix = ".ug-b-"' in source
    assert (
        'const string legacyBackupPrefix = ".UGSci Desktop.backup-"' in source
    )
    assert 'Guid.TryParseExact(backupId, "N"' in source
    assert (
        'Path.Combine(Path.GetFullPath(expectedRoot), "UGSci Desktop.lnk")'
        in source
    )
    assert 'path + ".invalid-" + Guid.NewGuid().ToString("N")' in source


def test_assistant_restores_staged_transaction_and_windows_state() -> None:
    source = SOURCE.read_text(encoding="utf-8")

    for stage in ("prepared", "old-moved", "new-activated", "registered"):
        rejected = f'value.stage != "{stage}"' in source
        handled = f'value.stage == "{stage}"' in source
        assert rejected or handled
    assert (
        'value.stage == "prepared" && !Directory.Exists(value.backup_dir)'
        in source
    )
    assert "Infer that narrow" in source
    assert "RestorePreviousWindowsState(value)" in source
    assert (
        'Environment.SetEnvironmentVariable("Path", value.previous_user_path'
        in source
    )
    assert "previous_uninstall_key_path" in source
    assert "previous_uninstall_values" in source
    assert "Registry.CurrentUser.DeleteSubKeyTree(canonical, false)" in source
    assert (
        "Registry.CurrentUser.CreateSubKey(value.previous_uninstall_key_path)"
        in source
    )
    assert "ConvertRegistryValue(entry.value, kind)" in source
    assert "DeleteTransactionAndStaging(value)" in source


def test_tauri_waits_for_the_visible_ready_signal_before_exit() -> None:
    updates_path = REPO_ROOT / "console" / "src-tauri" / "src" / "updates.rs"
    updates = updates_path.read_text(encoding="utf-8")

    assert 'join("UGSciUpdateAssistant.exe")' in updates
    assert '.arg("--ready-file")' in updates
    assert "if ready_file.is_file()" in updates
    assert "did not show its window in time" in updates
    install_body = updates.split("fn install_cached_windows", 1)[1].split(
        "fn launch_windows_update_assistant",
        1,
    )[0]
    assert install_body.index(
        "launch_windows_update_assistant",
    ) < install_body.index("result?;")
    assert install_body.index("result?;") < install_body.index(
        "app.cleanup_before_exit()",
    )


def test_assistant_extracts_with_long_path_safe_io() -> None:
    source = SOURCE.read_text(encoding="utf-8")

    assert "private static string ToExtendedPath(string path)" in source
    assert "private static string PathForIo(string path)" in source
    assert "PathForIo(output)" in source
    assert "Unsafe ZIP entry path" in source
    assert 'segment == ".." || segment == "."' in source
    assert "Path.GetFullPath(Path.Combine(destination, name))" not in source
    assert '"UGSci", "u"' in source
