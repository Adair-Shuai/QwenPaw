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
    REPO_ROOT / "scripts" / "pack-tauri" / "build_windows_portable_zip.py"
)
TREE_PREPARER = (
    REPO_ROOT / "scripts" / "pack-tauri" / "prepare_windows_portable_tree.py"
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
    assert "FileExistsLongPath(canonicalPath)" in source
    assert "GetFileAttributesW" in source
    assert "CreateFileW" in source
    assert "ToExtendedPath(path)" in source
    assert "PathForIo" not in source
    assert "if (!File.Exists(fullPath))" not in source
    assert "File.OpenRead(path)" not in source
    assert (
        'string manifest = Path.Combine(root, "checksums.sha256");' in source
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


def test_installer_bundles_offline_webview2_and_continues_if_missing() -> None:
    script = _script()
    source = BOOTSTRAP.read_text(encoding="utf-8")
    lib_rs = (
        REPO_ROOT / "console" / "src-tauri" / "src" / "lib.rs"
    ).read_text(
        encoding="utf-8",
    )

    assert "MicrosoftEdgeWebView2RuntimeInstallerX64.exe" in script
    assert "https://go.microsoft.com/fwlink/?linkid=2124701" in script
    assert "Assert-PackedWebView2Installer" in script
    assert "function Test-WebView2RuntimeInstalled {" in script
    assert "function Install-WebView2Runtime([string]$Installer)" in script
    assert "Write-WebView2MissingMarker $DestinationDir" in script
    assert "throw (Get-WebView2MissingMessage)" not in script
    assert "UGSci Desktop Setup will continue." in script
    assert "desktop window and visualization stay unavailable" in script
    assert "webview2-missing.txt" in script
    assert "Ensure-WebView2 -DestinationDir $stagingDir" in script
    assert (
        'Path.Combine("payload", '
        '"MicrosoftEdgeWebView2RuntimeInstallerX64.exe")' in source
    )
    assert "an internet connection is not required for that step" in source
    assert "If WebView2 still cannot be installed, Setup continues." in source
    assert "webview2-missing.txt" in source
    assert "GetInstallCompleteMessage" in source
    assert '"type": "offlineInstaller"' in (
        REPO_ROOT / "console" / "src-tauri" / "tauri.conf.json"
    ).read_text(encoding="utf-8")
    assert "try_install_bundled_webview2" in lib_rs
    assert "notify_desktop_window_unavailable" in lib_rs


def test_windows_verifier_accepts_registered_webview2() -> None:
    verifier = REPO_ROOT / "scripts" / "verify" / "launch_tauri_windows.ps1"
    source = verifier.read_text(encoding="utf-8")

    assert "WebView2 runtime is registered on this machine" in source
    assert (
        "EdgeUpdate\\Clients\\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" in source
    )
    assert (
        "::warning::WebView2 runtime is not installed "
        "and no bootstrapper was found in install dir"
    ) in source


def test_cli_launcher_uses_python_module_entry_point() -> None:
    launcher = (
        REPO_ROOT
        / "scripts"
        / "pack-tauri"
        / "windows_qwenpaw_cli_launcher.cs"
    )
    source = launcher.read_text(encoding="utf-8")

    assert 'new List<string> { "-m", "qwenpaw" }' in source
    assert '"qwenpaw.cli.main"' not in source
    assert "python -m qwenpaw reaches src/qwenpaw/__main__.py" in source


def test_bootstrap_checksum_contract_matches_layered_payload() -> None:
    source = BOOTSTRAP.read_text(encoding="utf-8")

    assert (
        'Path.Combine("payload", "binaries", "state", "active.json")' in source
    )
    assert (
        'Path.Combine("payload", "binaries", "cli", "qwenpaw.exe")' in source
    )
    assert (
        'Path.Combine("payload", "binaries", "update-assistant", '
        '"UGSciUpdateAssistant.exe")' in source
    )
    assert (
        'Path.Combine("payload", "binaries", "qwenpaw-backend"' not in source
    )


def test_packager_prunes_bytecode_and_uses_verified_zip_builder() -> None:
    script = _script()
    builder = ZIP_BUILDER.read_text(encoding="utf-8")
    preparer = TREE_PREPARER.read_text(encoding="utf-8")

    assert "prepare_windows_portable_tree.py" in script
    assert 'directory == "__pycache__"' in preparer
    assert 'endswith((".pyc", ".pyo"))' in preparer
    assert 'return "\\\\\\\\?\\\\" + native' in preparer
    assert "build_windows_portable_zip.py" in script
    assert "Compress-Archive -Path" not in script
    assert "allowZip64=True" in builder
    assert "archive.testzip()" in builder
    assert "archived != expected" in builder
    assert 'return "\\\\\\\\?\\\\" + native' in builder
    assert "onerror=walk_errors.append" in builder


def test_installer_file_transactions_are_long_path_safe() -> None:
    script = _script()

    assert "function ConvertTo-LongIoPath" in script
    assert "function Copy-DirectoryLongPathSafe" in script
    assert "function Remove-DirectoryLongPathSafe" in script
    assert "[IO.Directory]::EnumerateFiles" in script
    assert "[IO.File]::Copy" in script
    assert "Copy-DirectoryLongPathSafe -Source $payloadRoot" in script
    assert "Remove-DirectoryLongPathSafe -Path $installDir" in script
    assert (
        '$stagingDir = Join-Path $transactionParent ".ug-i-$transactionId"'
        in script
    )
    assert (
        '$backupDir = Join-Path $transactionParent ".ug-b-$transactionId"'
        in script
    )
    assert "[IO.Directory]::EnumerateFiles($rootIo" in script


def test_first_level_install_does_not_recreate_drive_root() -> None:
    """Installing to C:\\UGSci must not call New-Item against C:\\ itself."""
    script = _script()

    parent_block = script.split(
        "$installParent = Split-Path -Parent $installDir",
        1,
    )[1].split('$appExe = Join-Path $installDir "UGSci.exe"', 1)[0]
    assert "New-Item -ItemType Directory -Path $installParent" not in (
        parent_block
    )
    assert "Test-Path -LiteralPath $installParent -PathType Container" in (
        parent_block
    )
    assert "[IO.Directory]::CreateDirectory($installParent)" in parent_block
    assert "The installation folder has an invalid parent path" in parent_block


def test_installer_forces_utf8_when_capturing_localized_errors() -> None:
    """Setup.exe must not mojibake Windows PowerShell error messages."""
    script = _script()

    assert "$utf8Encoding = New-Object Text.UTF8Encoding($false)" in script
    assert "[Console]::OutputEncoding = $utf8Encoding" in script
    assert "$OutputEncoding = $utf8Encoding" in script


def test_setup_requires_administrator_by_default() -> None:
    script = _script()
    source = BOOTSTRAP.read_text(encoding="utf-8")
    manifest = (
        REPO_ROOT
        / "scripts"
        / "pack-tauri"
        / "windows_portable_setup.manifest"
    ).read_text(encoding="utf-8")

    assert 'level="requireAdministrator"' in manifest
    assert "/win32manifest:$setupManifest" in script
    assert "windows_portable_setup.manifest" in script
    assert 'Join-Path $env:ProgramFiles "UGSci Desktop"' in script
    assert 'Join-Path $env:LOCALAPPDATA "UGSci Desktop"' not in script
    assert "function Invoke-ElevatedInstaller" in script
    assert 'Verb = "RunAs"' in script
    assert '"-Elevated"' in script
    assert (
        '"-InstallDir", (Quote-ProcessArgument $ResolvedInstallDir)' in script
    )
    assert "Administrator approval was cancelled" in script
    assert "-not $Elevated -and -not (Test-CurrentProcessElevated)" in script
    assert "$Elevated -and -not (Test-CurrentProcessElevated)" in script
    assert "$installRequiresElevation" not in script
    assert "function Test-DirectoryWriteRequiresElevation" not in script
    assert "Administrator approval is required to install UGSci Desktop." in (
        script
    )
    assert 'SpecialFolder.ProgramFiles), "UGSci Desktop"' in source
    assert "Setup requires administrator permission." in source
    assert "The default location is Program Files." in source


def test_installer_stages_at_short_same_volume_path() -> None:
    script = _script()

    assert "$transactionParent = if (" in script
    assert "$installRoot -match '^[A-Za-z]:\\\\$'" in script
    assert (
        '$stagingDir = Join-Path $transactionParent ".ug-i-$transactionId"'
        in script
    )
    assert (
        '$backupDir = Join-Path $transactionParent ".ug-b-$transactionId"'
        in script
    )
    assert ".UGSci Desktop.install-" not in script
    assert "Copy-Item -Destination $stagingDir -Recurse -Force" not in script
    assert "Copy-DirectoryLongPathSafe -Source $payloadRoot" in script


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


def test_prepare_portable_tree_rejects_windows_breaking_paths(
    tmp_path: Path,
) -> None:
    spec = importlib.util.spec_from_file_location(
        "prepare_windows_portable_tree",
        TREE_PREPARER,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    root = tmp_path / "portable"
    nested = root / "payload" / "deep"
    nested.mkdir(parents=True)
    (nested / "file.py").write_text("x", encoding="utf-8")
    manifest = root / "checksums.sha256"

    try:
        module.prepare(root, manifest, max_relative_path=10)
    except ValueError as error:
        assert "over 10 characters" in str(error)
        assert "Windows Explorer extraction will drop them" in str(error)
    else:
        raise AssertionError("overlong portable path was accepted")


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
        'Path.Combine(location, "binaries", "state", "active.json")' in source
    )
    assert 'Path.Combine(location, "version.json")' in source


def test_bootstrap_explains_install_folder_failures_before_copy() -> None:
    source = BOOTSTRAP.read_text(encoding="utf-8")

    assert "TryAcceptInstallLocation()" in source
    assert "FindRegisteredInstallLocation()" in source
    assert "IsExistingUGSciInstall(normalized)" in source
    assert "GetUnrelatedInstallEntries(normalized)" in source
    assert "UnrecognizedNonEmptyFolderMessage()" in source
    assert "UnrelatedInstallEntriesMessage(PreviewEntryNames(unrelated))" in (
        source
    )
    assert "AlreadyInstalledElsewhereMessage(registered)" in source
    assert "locationStatus.Text = FirstLine(validationError)" in source
    assert "Click Next to check this folder before installing." in source
    assert (
        "not empty and is not a recognized UGSci Desktop installation"
        in source
    )
    assert "or the legacy name qwenpaw-desktop.exe" in source
    assert "binaries\\\\state\\\\active.json" in source
    assert "desktop.ini in this folder" in source
    assert "Setup will not delete" in source
    assert "cannot install to a second location" in source
    assert "if (!TryAcceptInstallLocation())" in source


def test_bootstrap_prompts_to_close_running_ugsci() -> None:
    source = BOOTSTRAP.read_text(encoding="utf-8")

    assert "ConfirmCloseRunningApplications()" in source
    assert "FindBlockingSetupProcesses(BlockingProcessRoots())" in source
    assert "QueryFullProcessImageNameW" in source
    assert "KillBlockingSetupProcesses(running)" in source
    assert "/PID " in source and " /T /F" in source
    assert "Close these processes now?" in source
    assert "including copies started from the extracted package" in source
    assert (
        "If UGSci Desktop is still running — including a copy started "
        "from this extracted folder"
    ) in source
    assert "Setup could not close the following processes." in source


def test_installer_stops_package_processes_without_killing_setup() -> None:
    script = _script()

    assert "[string[]]$Root" in script
    assert "[int[]]$ExcludePids" in script
    assert "Stop-ScopedApplication -Root @($installDir, $sourceRoot)" in (
        script
    )
    assert "System32\\taskkill.exe" in script
    assert '"/PID", [string]$process.ProcessId, "/T", "/F"' in script
    assert "$installerParentPid" in script
    assert "Stop-ScopedApplication -Root $installDir\n" not in script


def test_installer_script_matches_bootstrap_folder_failure_copy() -> None:
    script = _script()

    assert "function Get-UnrecognizedNonEmptyFolderMessage {" in script
    assert "function Get-UnrelatedInstallEntriesMessage([string]$Preview)" in (
        script
    )
    assert (
        "function Get-AlreadyInstalledElsewhereMessage([string]$ExistingDir)"
        in (script)
    )
    assert "throw (Get-UnrecognizedNonEmptyFolderMessage)" in script
    assert (
        "throw (Get-UnrelatedInstallEntriesMessage -Preview $preview)"
        in script
    )
    assert (
        "throw (Get-AlreadyInstalledElsewhereMessage "
        "-ExistingDir $existingInstallDir)"
    ) in script
    assert "or the legacy name qwenpaw-desktop.exe" in script
    assert "desktop.ini in this folder" in script
    assert "cannot install to a second location" in script
    assert (
        "The selected installation folder is not empty and is not a "
        "recognized UGSci Desktop installation. Choose an empty folder."
    ) not in script
    assert ("Uninstall it before choosing a different location.") not in script


def test_installer_preflights_aggregated_disk_space_before_mutation() -> None:
    script = _script()

    assert "function Get-DirectorySizeBytes" in script
    assert "[IO.DriveInfo]::new($root).AvailableFreeSpace" in script
    assert "function Assert-SufficientDiskSpace" in script
    assert "$contentBytes * 0.05" in script
    assert "[Math]::Max(512MB" in script
    assert "Insufficient disk space on" in script
    assert "user-data rollback backup" in script
    assert "application staging and preserved install data" in script
    assert "$installBytes += [int64]$backupPlan.InstallLocalBytes" in script
    assert "Requirements sharing a volume are summed" in script
    preflight = script.index(
        "Assert-SufficientDiskSpace -Requirement $spaceRequirements",
    )
    stop_apps = script.index("Stop-ScopedApplication -Root")
    create_staging = script.index(
        "New-Item -ItemType Directory -Path $stagingDir",
    )
    backup = script.index("New-UpdateDataBackup -ReleaseVersion")
    assert preflight < stop_apps < create_staging < backup


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


def test_bootstrap_missing_file_error_guides_long_path_extraction() -> None:
    source = BOOTSTRAP.read_text(encoding="utf-8")

    assert '"Package file is missing: " + relative' in source
    assert "extract to a short path" in source
    assert "use 7-Zip" in source
