# -*- coding: utf-8 -*-
"""Regression guards for the Windows portable install transaction."""

from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
INSTALLER = (
    REPO_ROOT
    / "scripts"
    / "pack-tauri"
    / "create_windows_portable_installer.ps1"
)


def _script() -> str:
    return INSTALLER.read_text(encoding="utf-8")


def test_failed_initial_rename_cannot_delete_the_original_install() -> None:
    """A locked b5/b6 executable must leave the old tree untouched."""
    script = _script()

    assert "$previousTreeMoved = $false" in script
    assert "$newTreeActivated = $false" in script
    assert "function Move-DirectoryWithRetry" in script
    assert "Move-Item -LiteralPath $Source -Destination $Destination" in script
    assert "Move-DirectoryWithRetry -Source $installDir" in script
    assert "$previousTreeMoved = $true" in script
    assert (
        "Move-Item -LiteralPath $stagingDir -Destination $installDir" in script
    )
    assert "$newTreeActivated = $true" in script
    assert (
        "if ($newTreeActivated -and (Test-Path -LiteralPath $installDir))"
        in script
    )
    assert "if ($previousTreeMoved)" in script

    # The b6 bug unconditionally removed installDir in catch even when the
    # first Move-Item failed, then falsely claimed that rollback succeeded.
    catch_body = script.split("$installError = $_", 1)[1].split(
        "} finally {", 1,
    )[0]
    assert (
        "Remove-Item -LiteralPath $installDir -Recurse -Force "
        "-ErrorAction SilentlyContinue"
        not in catch_body
    )
    assert "the previous installation was restored" not in catch_body


def test_rollback_verifies_the_restored_executable() -> None:
    script = _script()

    assert (
        'Test-Path -LiteralPath (Join-Path $installDir "UGSci.exe") '
        "-PathType Leaf"
        in script
    )
    assert "rollback restored an invalid application tree" in script
    assert '"rollback failed: $rollbackError"' in script


def test_update_assistant_can_defer_commit_until_external_health_check(
) -> None:
    script = _script()

    assert "[switch]$DeferredCommit" in script
    assert "[string]$TransactionFile" in script
    assert (
        "Deferred update commit requires a recoverable previous installation"
        in script
    )
    assert "schema_version = 1" in script
    assert "backup_dir = $backupDir" in script
    assert "previous_version = $previousVersion" in script
    assert '[Guid]::NewGuid().ToString("N")' in script
    assert "start_menu_shortcut_base64" in script
    assert "desktop_shortcut_base64" in script
    assert "setup will not overwrite recovery data" in script
    assert "} elseif (Test-Path $backupDir)" in script
