# -*- coding: utf-8 -*-
"""Run the actual compiled installer file operations against isolated trees."""

from __future__ import annotations

import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

import pytest

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "scripts/pack-tauri/windows_installer_io.cs"
BUILDER = ROOT / "scripts/pack-tauri/create_windows_portable_installer.ps1"
pytestmark = pytest.mark.skipif(
    sys.platform != "win32",
    reason="Requires the shipping Windows .NET Framework installer runtime",
)
HARNESS = r"""
using System;
using System.Diagnostics;
using System.Web.Script.Serialization;
internal static class InstallerProbe
{
    private static int Main(string[] args)
    {
        // Match Windows PowerShell's .NET path handling, including the
        // extended-length paths used by the actual embedded installer helper.
        AppContext.SetSwitch("Switch.System.IO.UseLegacyPathHandling", false);
        AppContext.SetSwitch("Switch.System.IO.BlockLongPaths", false);
        Console.OutputEncoding = new System.Text.UTF8Encoding(false);
        var clock = Stopwatch.StartNew();
        string error = null;
        object result = null;
        try {
            if (args[0] == "verify")
                result = UGSciInstallerIO.VerifyPackage(args[1],
                    new[] { "payload/required.txt".Replace('/', '\\') });
            else if (args[0] == "size")
                result = UGSciInstallerIO.DirectorySize(args[1]);
            else if (args[0] == "copy")
                result = UGSciInstallerIO.CopyDirectory(args[1], args[2]);
            else if (args[0] == "copy-progress")
                result = UGSciInstallerIO.CopyDirectory(args[1], args[2],
                    false,
                    UGSciInstallerIO.DirectorySize(args[1]));
            else if (args[0] == "copy-user")
                result = UGSciInstallerIO.CopyDirectory(
                    args[1], args[2], true);
            else throw new Exception("Unknown probe operation");
        }
        catch (Exception failure) {
            error = failure.GetType().Name + ": " + failure.Message;
        }
        Console.WriteLine(new JavaScriptSerializer().Serialize(new {
            result = result, error = error,
            elapsed_ms = clock.Elapsed.TotalMilliseconds
        }));
        return error == null ? 0 : 2;
    }
}
"""


@pytest.fixture(scope="module", name="installer_probe")
def _installer_probe(tmp_path_factory):
    directory = tmp_path_factory.mktemp("installer-io-compiled")
    compiler = (
        Path(os.environ["WINDIR"])
        / "Microsoft.NET/Framework64/v4.0.30319/csc.exe"
    )
    if not compiler.is_file():
        compiler = (
            Path(os.environ["WINDIR"])
            / "Microsoft.NET/Framework/v4.0.30319/csc.exe"
        )
    assert compiler.is_file(), "Windows desktop build requires csc.exe"
    harness = directory / "probe.cs"
    harness.write_text(HARNESS, encoding="utf-8")
    executable = directory / "probe.exe"
    completed = subprocess.run(
        [
            str(compiler),
            "/nologo",
            "/optimize+",
            "/target:exe",
            f"/out:{executable}",
            "/reference:System.Web.Extensions.dll",
            str(harness),
            str(SOURCE),
        ],
        capture_output=True,
        text=True,
        timeout=60,
        creationflags=subprocess.CREATE_NO_WINDOW,
        check=False,
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    return executable


def _run(probe, operation, *paths):
    completed = subprocess.run(
        [str(probe), operation, *map(str, paths)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=60,
        creationflags=subprocess.CREATE_NO_WINDOW,
        check=False,
    )
    assert completed.stdout, completed.stderr
    return completed.returncode, json.loads(completed.stdout.splitlines()[-1])


@pytest.mark.parametrize(
    ("deferred", "previous", "disabled", "expected"),
    [
        (True, "none", False, False),
        (True, "current", False, True),
        (True, "legacy", False, True),
        (True, "prefix", False, False),
        (True, "current", True, False),
        (False, "none", False, True),
    ],
)
def test_deferred_installer_preserves_cli_path_preference(
    tmp_path,
    deferred,
    previous,
    disabled,
    expected,
):
    source = BUILDER.read_text(encoding="utf-8")
    decision = source.split("  $cliScripts = Join-Path $installDir", 1)[1]
    decision = (
        "  $cliScripts = Join-Path $installDir"
        + decision.split(
            "  $version = [string]$packageVersion.version",
            1,
        )[0]
    )
    (tmp_path / "binaries/cli").mkdir(parents=True)
    (tmp_path / "binaries/cli/qwenpaw.exe").write_bytes(
        b"isolated CLI fixture",
    )
    helper = tmp_path / "update-qwenpaw-path.ps1"
    helper.write_text(
        "param([string]$Action, [string]$Path)\n"
        "Write-Host ('[PATH-ACTION] ' + $Action + '|' + $Path)\n",
        encoding="utf-8-sig",
    )
    root = str(tmp_path).replace("'", "''")
    entry = {
        "none": "C:\\unrelated\\bin",
        "current": str(tmp_path / "binaries/cli"),
        "legacy": str(tmp_path / "binaries/python-runtime/python/Scripts"),
        "prefix": str(tmp_path / "binaries/cli-extra"),
    }[previous]
    # Historical PATH spelling is matched without writing the user's registry.
    entry = (' "' + entry.swapcase() + '\\" ').replace("'", "''")
    script = tmp_path / "cli-choice.ps1"
    script.write_text(
        "$ErrorActionPreference = 'Stop'\n"
        "[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)\n"
        f"$installDir = '{root}'\n$existingInstallDir = $installDir\n"
        f"$previousUserPath = '{entry}'\n$Silent = $true\n"
        f"$DeferredCommit = ${str(deferred).lower()}\n"
        f"$NoCliPath = ${str(disabled).lower()}\n"
        + decision
        + "\n@{enabled=$enableCliPath; marker="
        "(Test-Path -LiteralPath (Join-Path $installDir 'cli-path.txt'))} "
        "| ConvertTo-Json -Compress | Write-Host\n",
        encoding="utf-8-sig",
    )
    result = subprocess.run(
        [
            "powershell.exe",
            "-NoProfile",
            "-NonInteractive",
            "-File",
            str(script),
        ],
        capture_output=True,
        encoding="utf-8-sig",
        check=False,
        timeout=30,
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert json.loads(result.stdout.splitlines()[-1]) == {
        "enabled": expected,
        "marker": expected,
    }
    cli_action = "Add" if expected else "Remove"
    assert f"[PATH-ACTION] {cli_action}|{tmp_path}\\binaries\\cli" in (
        result.stdout
    )


def test_installer_replaces_legacy_shortcut_icons_on_upgrade(tmp_path):
    source = BUILDER.read_text(encoding="utf-8")
    start = source.index("  $shell = New-Object -ComObject WScript.Shell")
    end = source.index(
        '  Complete-InstallerPhase "Registering application"',
        start,
    )
    registration = source[start:end]
    script = tmp_path / "shortcut-upgrade.ps1"
    helper = base64.b64encode(SOURCE.read_bytes()).decode("ascii")
    directory = str(tmp_path).replace("'", "''")
    script.write_text(
        "$ErrorActionPreference = 'Stop'\n"
        f"Add-Type -TypeDefinition ([Text.Encoding]::UTF8.GetString("
        f"[Convert]::FromBase64String('{helper}')))\n"
        f"$installDir = '{directory}'\n"
        "$appExe = Join-Path $installDir 'UGSci.exe'\n"
        "$oldIcon = Join-Path $installDir 'legacy-icon.ico'\n"
        "$startMenuShortcutPath = Join-Path $installDir 'Start.lnk'\n"
        "$desktopShortcutPath = Join-Path $installDir 'Desktop.lnk'\n"
        "[IO.File]::WriteAllText($appExe, 'isolated test executable')\n"
        "$shell = New-Object -ComObject WScript.Shell\n"
        "foreach ($path in "
        "@($startMenuShortcutPath, $desktopShortcutPath)) {\n"
        "  $link = $shell.CreateShortcut($path)\n"
        "  $link.TargetPath = $appExe\n"
        '  $link.IconLocation = "$oldIcon,0"\n'
        "  $link.Save()\n"
        "}\n"
        "$NoDesktopShortcut = $false\n$DeferredCommit = $false\n"
        + registration
        + "\n@($startMenuShortcutPath, $desktopShortcutPath) "
        "| ForEach-Object {\n"
        "  $link = $shell.CreateShortcut($_)\n"
        "  if ($link.TargetPath -ne $appExe) "
        "{ throw 'Stale shortcut target' }\n"
        '  if ($link.IconLocation -ne "$appExe,0") '
        "{ throw 'Stale shortcut icon' }\n"
        "}\nWrite-Output 'updated both shortcut icons'\n",
        encoding="utf-8-sig",
    )
    result = subprocess.run(
        [
            "powershell.exe",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(script),
        ],
        capture_output=True,
        text=True,
        timeout=60,
        creationflags=subprocess.CREATE_NO_WINDOW,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert "updated both shortcut icons" in result.stdout


def _package(root):
    files = {
        "payload/required.txt": b"required",
        "version.json": b'{"version":"test"}',
        "payload/empty.bin": b"",
        "payload/模板/井筒-é-Δ.txt": "中文模板与数值 0".encode("utf-8"),
        "payload/big.bin": b"large payload\x00" * 150_000,
        **{
            f"payload/group-{index % 5}/file-{index}.py": (
                f"VALUE = {index}\n".encode() * 12
            )
            for index in range(60)
        },
    }
    for name, content in files.items():
        target = root / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
    manifest = root / "checksums.sha256"
    manifest.write_text(
        "".join(
            f"{hashlib.sha256(content).hexdigest()}  {name}\n"
            for name, content in files.items()
        ),
        encoding="utf-8",
    )
    return files, manifest


def test_installer_compiled_verification_counts_payload_and_rechecks_changes(
    tmp_path,
    installer_probe,
):
    files, _ = _package(tmp_path)
    code, result = _run(installer_probe, "verify", tmp_path)
    assert code == 0, result
    assert result["result"] == {
        "PayloadBytes": sum(
            len(data)
            for name, data in files.items()
            if name.startswith("payload/")
        ),
        "FileCount": len(files),
    }
    # Never trust the result of a previous bootstrap/process verification.
    (tmp_path / "payload/required.txt").write_bytes(b"modified")
    code, result = _run(installer_probe, "verify", tmp_path)
    assert code == 2
    assert "Package checksum mismatch" in result["error"]


@pytest.mark.parametrize(
    "change, message",
    [
        ("duplicate", "Duplicate checksum entry"),
        ("traversal", "Unsafe checksum path"),
        ("alias", "Unsafe checksum path"),
        ("stream", "Unsafe checksum path"),
        ("bad-hash", "Invalid checksum manifest entry"),
        ("unchecked", "Unchecked package file"),
        ("missing", "Package file is missing"),
        ("required", "Required checksum entry is missing"),
    ],
)
def test_installer_compiled_verification_rejects_unsafe_or_incomplete_package(
    tmp_path,
    installer_probe,
    change,
    message,
):
    _, manifest = _package(tmp_path)
    text = manifest.read_text(encoding="utf-8")
    first = text.splitlines()[0]
    if change == "duplicate":
        text += first.upper() + "\n"
    elif change in ("traversal", "alias", "stream"):
        relative = {
            "traversal": "../outside.txt",
            "alias": "payload/../required.txt",
            "stream": "payload/required.txt:alternate",
        }[change]
        text += "0" * 64 + "  " + relative + "\n"
    elif change == "bad-hash":
        text = "x" + text[1:]
    elif change == "unchecked":
        (tmp_path / "extra.py").write_text("unchecked", encoding="utf-8")
    elif change == "missing":
        (tmp_path / "payload/required.txt").unlink()
    elif change == "required":
        (tmp_path / "payload/required.txt").unlink()
        text = "\n".join(text.splitlines()[1:]) + "\n"
    manifest.write_text(text, encoding="utf-8")
    code, result = _run(installer_probe, "verify", tmp_path)
    assert code == 2, result
    assert message in result["error"]


def test_installer_compiled_copy_and_size_preserve_deep_and_empty_trees(
    tmp_path,
    installer_probe,
):
    source, destination = tmp_path / "source", tmp_path / "destination"
    files, _ = _package(source)
    deep_name = "/".join(["deep-segment"] * 18 + ["unicode-内容.bin"])
    source_io = Path("\\\\?\\" + str(source))
    destination_io = Path("\\\\?\\" + str(destination))
    deep = source_io / deep_name
    deep.parent.mkdir(parents=True)
    deep.write_bytes(b"deep bytes")
    (source / "empty-directory").mkdir()
    files[deep_name] = deep.read_bytes()
    files["checksums.sha256"] = (source / "checksums.sha256").read_bytes()
    code, result = _run(installer_probe, "size", source)
    assert code == 0, result
    assert result["result"] == sum(map(len, files.values()))
    code, result = _run(installer_probe, "copy", source, destination)
    assert code == 0, result
    assert result["result"] == len(files)
    assert (destination_io / "empty-directory").is_dir()
    assert {
        file.relative_to(destination_io).as_posix(): file.read_bytes()
        for file in destination_io.rglob("*")
        if file.is_file()
    } == files
    assert (source_io / deep_name).read_bytes() == b"deep bytes"


def _junction(link, target):
    # PowerShell creates only this explicitly named fixture junction. No
    # filesystem enumeration or deletion is passed between different shells.
    completed = subprocess.run(
        [
            "powershell.exe",
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            "New-Item -ItemType Junction -Path '"
            + str(link).replace("'", "''")
            + "' -Target '"
            + str(target).replace("'", "''")
            + "' | Out-Null",
        ],
        capture_output=True,
        text=True,
        timeout=30,
        creationflags=subprocess.CREATE_NO_WINDOW,
        check=False,
    )
    assert completed.returncode == 0, completed.stderr


def test_installer_compiled_io_refuses_package_and_destination_junctions(
    tmp_path,
    installer_probe,
):
    package, outside = tmp_path / "package", tmp_path / "outside"
    _package(package)
    outside.mkdir()
    protected = outside / "required.txt"
    protected.write_bytes(b"user content")
    link = package / "payload/junction"
    _junction(link, outside)
    try:
        code, result = _run(installer_probe, "verify", package)
        assert code == 2, result
        assert "reparse point" in result["error"]
        code, result = _run(
            installer_probe,
            "copy",
            package,
            tmp_path / "copy",
        )
        assert code == 2, result
        assert "reparse point" in result["error"]
    finally:
        link.rmdir()
    destination = tmp_path / "destination"
    destination.mkdir()
    link = destination / "payload"
    _junction(link, outside)
    try:
        code, result = _run(installer_probe, "copy", package, destination)
        assert code == 2, result
        assert "reparse point" in result["error"]
        assert protected.read_bytes() == b"user content"
    finally:
        link.rmdir()


def test_installer_compiled_copy_refuses_overlapping_trees(
    tmp_path,
    installer_probe,
):
    source = tmp_path / "source"
    source.mkdir()
    (source / "original.txt").write_bytes(b"keep")
    code, result = _run(installer_probe, "copy", source, source / "nested")
    assert code == 2, result
    assert "separate trees" in result["error"]
    assert not (source / "nested").exists()
    assert (source / "original.txt").read_bytes() == b"keep"


@pytest.mark.parametrize("nested_destination", [False, True])
def test_installer_compiled_copy_rejects_dangling_destination_root_junction(
    tmp_path,
    installer_probe,
    nested_destination,
):
    source, outside = tmp_path / "source", tmp_path / "outside"
    source.mkdir()
    (source / "file.txt").write_bytes(b"payload")
    outside.mkdir()
    link = tmp_path / "destination"
    _junction(link, outside)
    destination = link / "nested" if nested_destination else link
    outside.rmdir()
    try:
        assert not destination.exists()
        code, result = _run(installer_probe, "copy", source, destination)
        assert code == 2, result
        # .NET can report a dangling ancestor as an existing directory; its
        # final-path handle then fails instead of following it or writing.
        assert "reparse point" in result["error"] or result[
            "error"
        ].startswith("Win32Exception:"), result
        assert not outside.exists()
        assert (source / "file.txt").read_bytes() == b"payload"
    finally:
        link.rmdir()


def test_installer_compiled_copy_accepts_redirected_ancestors_but_not_overlap(
    tmp_path,
    installer_probe,
):
    actual = tmp_path / "actual"
    source = actual / "source"
    source.mkdir(parents=True)
    (source / "file.bin").write_bytes(b"preserved")
    alias = tmp_path / "redirected-documents"
    _junction(alias, actual)
    try:
        code, result = _run(
            installer_probe,
            "copy",
            alias / "source",
            alias / "destination",
        )
        assert code == 0, result
        assert (actual / "destination/file.bin").read_bytes() == b"preserved"
        code, result = _run(
            installer_probe,
            "copy",
            source,
            alias / "source/nested",
        )
        assert code == 2, result
        assert "separate trees" in result["error"]
        assert not (source / "nested").exists()
    finally:
        alias.rmdir()


def test_installer_compiled_preserves_user_root_junction_without_link_escape(
    tmp_path,
    installer_probe,
):
    models = tmp_path / "model-storage"
    models.mkdir()
    (models / "weights.bin").write_bytes(b"user model")
    link = tmp_path / "models"
    _junction(link, models)
    try:
        code, result = _run(installer_probe, "size", link)
        assert code == 0, result
        assert result["result"] == len(b"user model")
        target = tmp_path / "preserved-models"
        code, result = _run(installer_probe, "copy-user", link, target)
        assert code == 0, result
        assert (target / "weights.bin").read_bytes() == b"user model"
        code, result = _run(
            installer_probe,
            "copy",
            link,
            tmp_path / "package-copy",
        )
        assert code == 2, result
        assert "reparse point" in result["error"]
        outside = tmp_path / "outside"
        outside.mkdir()
        (outside / "secret.bin").write_bytes(b"not copied")
        nested = models / "nested"
        _junction(nested, outside)
        try:
            code, result = _run(installer_probe, "size", link)
            assert code == 0, result
            assert result["result"] == len(b"user model")
            code, result = _run(
                installer_probe,
                "copy-user",
                link,
                tmp_path / "unsafe-copy",
            )
            assert code == 2, result
            assert "reparse point" in result["error"]
            assert (outside / "secret.bin").read_bytes() == b"not copied"
        finally:
            nested.rmdir()
    finally:
        link.rmdir()


def test_installer_embeds_and_executes_compiled_helper_with_windows_powershell(
    tmp_path,
):
    builder = BUILDER.read_text(encoding="utf-8")
    template = builder.split("$installerTemplate = @'\n", 1)[1].split(
        "\n'@\n$installerIoSource",
        1,
    )[0]
    install = template.replace(
        "__UGSCI_INSTALLER_IO_BASE64__",
        base64.b64encode(SOURCE.read_bytes()).decode("ascii"),
    )
    generated = tmp_path / "install.ps1"
    generated.write_text(install, encoding="utf-8")
    helper = (
        install.split("Add-Type -TypeDefinition", 1)[1].split(
            "\n))",
            1,
        )[0]
        + "\n))"
    )
    script = tmp_path / "check.ps1"
    # Parse the full generated installer without executing registry/process
    # changes; compile its actual embedded source in the shipping PS 5.1 host.
    script.write_text(
        "$ErrorActionPreference = 'Stop'\n"
        "$tokens = $null; $errors = $null\n"
        "[Management.Automation.Language.Parser]::ParseFile("
        f"'{generated}', [ref]$tokens, [ref]$errors) | Out-Null\n"
        "if ($errors.Count) { throw ($errors | Out-String) }\n"
        "Add-Type -TypeDefinition" + helper + "\n"
        f"[UGSciInstallerIO]::DirectorySize('{tmp_path / 'missing'}')\n",
        encoding="utf-8-sig",
    )
    completed = subprocess.run(
        [
            "powershell.exe",
            "-NoProfile",
            "-NonInteractive",
            "-File",
            str(script),
        ],
        capture_output=True,
        text=True,
        timeout=60,
        creationflags=subprocess.CREATE_NO_WINDOW,
        check=False,
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    assert completed.stdout.strip() == "0"


def test_installer_streams_child_log_before_exit_and_preserves_failure_status(
    tmp_path,
):
    builder = BUILDER.read_text(encoding="utf-8")
    function = (
        "function Wait-InstallerProcessWithLog"
        + builder.split(
            "function Wait-InstallerProcessWithLog",
            1,
        )[1].split(
            "function Invoke-ElevatedInstaller",
            1,
        )[0]
    )
    child, parent = tmp_path / "child.ps1", tmp_path / "parent.ps1"
    log = tmp_path / "child.log"
    child.write_text(
        "$ErrorActionPreference = 'Stop'\n"
        f"$stream = [IO.File]::Open('{log}', 'Create', 'Write', "
        "[IO.FileShare]::ReadWrite)\n"
        "$writer = [IO.StreamWriter]::new($stream, "
        "[Text.UTF8Encoding]::new($false))\n"
        "$writer.AutoFlush = $true\n"
        "$writer.WriteLine('[UGSCI-INSTALL] Copying application files')\n"
        "Start-Sleep -Milliseconds 1500\n"
        "$writer.Write('[UGSCI-INSTALL] Finished: '); $writer.Flush()\n"
        "Start-Sleep -Milliseconds 300\n"
        "$writer.WriteLine('完整'); $writer.Dispose()\n"
        "exit 7\n",
        encoding="utf-8-sig",
    )
    parent.write_text(
        "$ErrorActionPreference = 'Stop'\n"
        "[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)\n"
        + function
        + "\n$child = Start-Process powershell.exe -WindowStyle Hidden "
        "-PassThru -ArgumentList @('-NoProfile', '-NonInteractive', "
        f"'-File', '\"{child}\"')\n"
        f"Wait-InstallerProcessWithLog -Process $child -LogPath '{log}'\n"
        "exit $child.ExitCode\n",
        encoding="utf-8-sig",
    )
    with (
        subprocess.Popen(
            [
                "powershell.exe",
                "-NoProfile",
                "-NonInteractive",
                "-File",
                str(parent),
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            creationflags=subprocess.CREATE_NO_WINDOW,
        ) as process,
        ThreadPoolExecutor(max_workers=1) as executor,
    ):
        try:
            first = executor.submit(process.stdout.readline).result(timeout=15)
            assert first.strip() == "[UGSCI-INSTALL] Copying application files"
            assert (
                process.poll() is None
            ), "Log was buffered until the child exited"
            remainder, error = process.communicate(timeout=15)
            assert process.returncode == 7, error
            assert remainder.strip() == "[UGSCI-INSTALL] Finished: 完整"
        finally:
            if process.poll() is None:
                process.kill()
                process.communicate(timeout=10)


def test_compiled_copy_reports_real_bytes_and_preserves_file_metadata(
    tmp_path,
    installer_probe,
):
    source, destination = tmp_path / "source", tmp_path / "destination"
    source.mkdir()
    large = source / "large.bin"
    large.write_bytes(b"native copy progress\n" * 500000)
    read_only = source / "read-only.txt"
    read_only.write_bytes(b"metadata retained")
    os.utime(read_only, (1700000000, 1700000000))
    read_only.chmod(0o444)
    command = [
        str(installer_probe),
        "copy-progress",
        str(source),
        str(destination),
    ]
    completed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=60,
        check=False,
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    progress = [
        tuple(map(int, line.split("|")[1:]))
        for line in completed.stdout.splitlines()
        if line.startswith("[UGSCI-PROGRESS] copy|")
    ]
    total = sum(path.stat().st_size for path in source.iterdir())
    assert progress[-1] == (total, total)
    assert all(done < size for done, size in progress[:-1])
    assert (destination / large.name).read_bytes() == large.read_bytes()
    copied = destination / read_only.name
    assert copied.read_bytes() == read_only.read_bytes()
    assert abs(copied.stat().st_mtime - read_only.stat().st_mtime) < 0.001
    assert copied.stat().st_file_attributes & 1
    # An overwrite of a read-only destination must fail, with no successful
    # completion event, preserving the previous native copy behavior.
    failed = subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=60,
        check=False,
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    assert failed.returncode == 2
    assert f"[UGSCI-PROGRESS] copy|{total}|{total}" not in failed.stdout
