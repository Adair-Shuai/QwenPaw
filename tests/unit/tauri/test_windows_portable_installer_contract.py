# -*- coding: utf-8 -*-
"""Regression guards for the Windows portable install transaction."""

import hashlib
import importlib.util
import zipfile
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
INSTALLER = (
    REPO_ROOT
    / "scripts"
    / "pack-tauri"
    / "create_windows_portable_installer.ps1"
)
BOOTSTRAP = (
    REPO_ROOT / "scripts" / "pack-tauri" / "windows_portable_bootstrap.cs"
)
ZIP_BUILDER = (
    REPO_ROOT
    / "scripts"
    / "pack-tauri"
    / "build_windows_portable_zip.py"
)


def _script() -> str:
    return INSTALLER.read_text(encoding="utf-8")


def test_packager_resolves_layered_backend_before_plugin_validation() -> None:
    script = _script()

    assert "$activeLayoutPath" in script
    assert "$backendComponent = $activeLayout.components.backend" in script
    assert script.index("$backendLayer = [IO.Path]::GetFullPath") < (
        script.index("$bundledPluginRoot = Join-Path $backendLayer")
    )
    assert "Portable installer backend component escapes or is missing" in (
        script
    )


def test_successful_install_resets_native_tool_exit_code() -> None:
    script = _script()
    success_tail = script.split(
        'Write-Host "UGSci Desktop $version installed to $installDir"',
        1,
    )[1].split("'@ | Set-Content", 1)[0]

    assert "exit 0" in success_tail


def test_bootstrap_supports_long_paths_and_rejects_escape_segments() -> None:
    source = BOOTSTRAP.read_text(encoding="utf-8")

    assert "string search = ToExtendedPath(directory.TrimEnd" in source
    assert "string fullPath = PathForIo(canonicalPath);" in source
    assert "if (!Path.IsPathRooted(path))" in source
    assert "path = Path.GetFullPath(path);" in source
    assert "return path.Length < 248 ? path : ToExtendedPath(path);" in source
    path_for_io = source.split(
        "private static string PathForIo(string path)", 1,
    )[1].split("private static string SafeRelativePath", 1)[0]
    assert path_for_io.index("Path.IsPathRooted(path)") < path_for_io.index(
        "Path.GetFullPath(path)",
    )
    assert (
        'string manifest = Path.Combine(root, "checksums.sha256");'
        in source
    )
    assert 'Path.Combine(ioRoot, "checksums.sha256")' not in source
    assert "EnumeratePackageFiles(root)" in source
    assert "FindFirstFileW" in source
    assert "FindNextFileW" in source
    assert "FileAttributes.ReparsePoint" in source
    legacy_enumeration = (
        'Directory.GetFiles(ioRoot, "*", SearchOption.AllDirectories)'
    )
    assert legacy_enumeration not in source
    assert "SafeRelativePath(match.Groups[2].Value)" in source
    assert 'segment == "." || segment == ".."' in source
    assert "segment.IndexOf(':') >= 0" in source
    assert 'return @"\\\\?\\" + path;' in source


def test_bootstrap_checksum_contract_matches_layered_payload() -> None:
    source = BOOTSTRAP.read_text(encoding="utf-8")

    assert (
        'Path.Combine("payload", "binaries", "state", "active.json")'
        in source
    )
    assert (
        'Path.Combine("payload", "binaries", "cli", "qwenpaw.exe")'
        in source
    )
    assert (
        'Path.Combine("payload", "binaries", "update-assistant", '
        '"UGSciUpdateAssistant.exe")' in source
    )
    assert (
        'Path.Combine("payload", "binaries", "qwenpaw-backend"'
        not in source
    )


def test_packager_prunes_bytecode_and_uses_verified_zip_builder() -> None:
    script = _script()
    builder = ZIP_BUILDER.read_text(encoding="utf-8")

    assert 'Where-Object { $_.Name -eq "__pycache__" }' in script
    assert '$_.Extension -in @(".pyc", ".pyo")' in script
    assert "build_windows_portable_zip.py" in script
    assert "Compress-Archive -Path" not in script
    assert "allowZip64=True" in builder
    assert "archive.testzip()" in builder
    assert "archived != expected" in builder


def test_verified_zip_builder_preserves_nested_manifest_members(
    tmp_path: Path,
) -> None:
    spec = importlib.util.spec_from_file_location(
        "build_windows_portable_zip",
        ZIP_BUILDER,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    root = tmp_path / "portable"
    deep = root.joinpath(*(["deep-segment"] * 8), "payload.py")
    deep.parent.mkdir(parents=True)
    deep.write_text("payload", encoding="utf-8")
    relative = deep.relative_to(root).as_posix()
    digest = hashlib.sha256(deep.read_bytes()).hexdigest()
    (root / "checksums.sha256").write_text(
        f"{digest}  {relative}\n",
        encoding="ascii",
    )

    destination = tmp_path / "portable.zip"
    module.build_archive(root, destination)

    with zipfile.ZipFile(destination) as archive:
        assert relative in archive.namelist()
        assert archive.read(relative) == b"payload"


def test_bootstrap_prefills_only_trusted_canonical_or_legacy_install() -> None:
    source = BOOTSTRAP.read_text(encoding="utf-8")

    assert '"UGSci Desktop", "QwenPaw Desktop", "QwenPaw"' in source
    assert 'key.GetValue("DisplayName") as string' in source
    assert 'key.GetValue("InstallLocation") as string' in source
    assert 'File.Exists(Path.Combine(location, "UGSci.exe"))' in source
    assert (
        'File.Exists(Path.Combine(location, "qwenpaw-desktop.exe"))' in source
    )
    assert (
        'Path.Combine(location, "binaries", "state", "active.json")'
        in source
    )
    assert 'Path.Combine(location, "version.json")' in source


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
        "} finally {",
        1,
    )[0]
    assert (
        "Remove-Item -LiteralPath $installDir -Recurse -Force "
        "-ErrorAction SilentlyContinue" not in catch_body
    )
    assert "the previous installation was restored" not in catch_body


def test_rollback_verifies_the_restored_executable() -> None:
    script = _script()

    assert (
        'Test-Path -LiteralPath (Join-Path $installDir "UGSci.exe") '
        "-PathType Leaf" in script
    )
    assert "rollback restored an invalid application tree" in script
    assert '"rollback failed: $rollbackError"' in script


def test_update_assistant_can_defer_commit_until_external_health_check() -> (
    None
):
    script = _script()

    assert "[switch]$DeferredCommit" in script
    assert "[string]$TransactionFile" in script
    assert (
        "Deferred update commit requires a recoverable previous installation"
        in script
    )
    assert "schema_version = 2" in script
    prepared = script.index('Write-InstallTransaction -Stage "prepared"')
    old_move = script.index("Move-DirectoryWithRetry -Source $installDir")
    activated = script.index(
        "Move-Item -LiteralPath $stagingDir -Destination $installDir",
    )
    assert prepared < old_move < activated
    assert 'Write-InstallTransaction -Stage "old-moved"' in script
    assert 'Write-InstallTransaction -Stage "new-activated"' in script
    assert 'Write-InstallTransaction -Stage "registered"' in script
    assert (
        "Move-Item -LiteralPath $temporary "
        "-Destination $TransactionFile -Force"
    ) in script
    assert "backup_dir = $backupDir" in script
    assert "staging_dir = $stagingDir" in script
    assert "previous_version = $previousVersion" in script
    assert "previous_user_path = $previousUserPath" in script
    assert "previous_uninstall_key_path = $previousUninstallKeyPath" in script
    assert "previous_uninstall_values = $previousUninstallValues" in script
    assert "Get-UninstallRegistrySnapshot" in script
    assert '[Guid]::NewGuid().ToString("N")' in script
    assert "start_menu_shortcut_base64" in script
    assert "desktop_shortcut_base64" in script
    assert "setup will not overwrite recovery data" in script
    assert "} elseif (Test-Path $backupDir)" in script
