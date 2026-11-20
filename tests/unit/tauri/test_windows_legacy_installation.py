# -*- coding: utf-8 -*-
"""Exercise legacy setup discovery using shipping .NET and PowerShell code."""

from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import sys
import uuid

import pytest

ROOT = Path(__file__).resolve().parents[3]
BUILDER = ROOT / "scripts/pack-tauri/create_windows_portable_installer.ps1"
pytestmark = pytest.mark.skipif(
    sys.platform != "win32",
    reason="Requires Windows desktop installer runtimes",
)

HARNESS = r"""
using System;
using System.IO;
using System.Reflection;
using System.Web.Script.Serialization;
using Microsoft.Win32;
internal static class LegacyInstallProbe
{
    private static int Main(string[] args)
    {
        Console.OutputEncoding = new System.Text.UTF8Encoding(false);
        var flags = BindingFlags.NonPublic | BindingFlags.Static;
        try
        {
            var assembly = Assembly.LoadFrom(args[1]);
            object result;
            if (args[0] == "registry")
            {
                // Isolated test key, outside the actual uninstall hive.
                string keyPath = @"Software\UGSciInstallerCompatibilityTests\"
                    + Guid.NewGuid().ToString("N");
                try
                {
                    using (var key = Registry.CurrentUser
                        .CreateSubKey(keyPath))
                        key.SetValue("InstallLocation", args[2]);
                    result = assembly.GetType("PortableSetup+SetupForm")
                        .GetMethod("ReadTrustedInstallLocation", flags)
                        .Invoke(null, new object[] { keyPath });
                }
                finally
                {
                    Registry.CurrentUser.DeleteSubKeyTree(keyPath, false);
                }
            }
            else
            {
                var type = assembly.GetType(
                    "UGSciUpdateAssistant+UpdateForm");
                result = type.GetMethod("ReadTransaction", flags)
                    .Invoke(null, new object[] { args[2] });
                result = new {
                    install_dir = result.GetType().GetProperty("install_dir")
                        .GetValue(result, null),
                    original_snapshot = File.ReadAllText(args[2])
                };
            }
            Console.WriteLine(new JavaScriptSerializer().Serialize(result));
            return 0;
        }
        catch (Exception error)
        {
            while (error.InnerException != null) error = error.InnerException;
            Console.WriteLine(error.GetType().Name + ": " + error.Message);
            return 1;
        }
    }
}
"""


@pytest.fixture(scope="module", name="legacy_probe")
def legacy_probe_fixture(tmp_path_factory):
    directory = tmp_path_factory.mktemp("legacy-install")
    compiler = (
        Path(os.environ["WINDIR"])
        / "Microsoft.NET/Framework64/v4.0.30319/csc.exe"
    )
    assert compiler.is_file()
    probe_source = directory / "probe.cs"
    probe_source.write_text(HARNESS, encoding="utf-8")
    references = [
        "System.dll",
        "System.Core.dll",
        "System.Drawing.dll",
        "System.Windows.Forms.dll",
        "System.Web.Extensions.dll",
        "System.IO.Compression.dll",
        "System.IO.Compression.FileSystem.dll",
    ]
    outputs = {}
    for name, source in (
        ("setup", ROOT / "scripts/pack-tauri/windows_portable_bootstrap.cs"),
        ("assistant", ROOT / "scripts/pack-tauri/windows_update_assistant.cs"),
        ("probe", probe_source),
    ):
        output = directory / (name + (".exe" if name == "probe" else ".dll"))
        completed = subprocess.run(
            [
                str(compiler),
                "/nologo",
                f"/target:{'exe' if name == 'probe' else 'library'}",
                f"/out:{output}",
                *(f"/reference:{reference}" for reference in references),
                str(source),
            ],
            capture_output=True,
            text=True,
            timeout=60,
            creationflags=subprocess.CREATE_NO_WINDOW,
            check=False,
        )
        assert completed.returncode == 0, completed.stdout + completed.stderr
        outputs[name] = output
    return outputs


def _invoke(probe, operation, value):
    assembly = probe["setup" if operation == "registry" else "assistant"]
    completed = subprocess.run(
        [str(probe["probe"]), operation, str(assembly), str(value)],
        capture_output=True,
        text=True,
        encoding="utf-8-sig",
        timeout=30,
        creationflags=subprocess.CREATE_NO_WINDOW,
        check=False,
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    return json.loads(completed.stdout)


@pytest.mark.parametrize("executable", ["UGSci.exe", "qwenpaw-desktop.exe"])
def test_setup_discovers_quoted_legacy_nsis_locations(
    tmp_path,
    legacy_probe,
    executable,
):
    install = tmp_path / "old UGSci"
    (install / "binaries/state").mkdir(parents=True)
    (install / "binaries/state/active.json").write_text("{}", encoding="utf-8")
    (install / executable).write_bytes(b"legacy executable fixture")
    assert _invoke(legacy_probe, "registry", str(install)) == str(install)
    assert _invoke(legacy_probe, "registry", f'  "{install}\\"  ') == str(
        install,
    )


@pytest.mark.parametrize(
    "value",
    ["missing", "foreign", "relative", "malformed", "uninstalled"],
)
def test_setup_ignores_removed_and_invalid_install_records(
    tmp_path,
    legacy_probe,
    value,
):
    foreign = tmp_path / "foreign"
    foreign.mkdir()
    (foreign / "notes.txt").write_text("keep", encoding="utf-8")
    uninstalled = tmp_path / "uninstalled"
    uninstalled.mkdir()
    (uninstalled / "version.json").write_text(
        '{"product":"UGSci Desktop"}',
        encoding="utf-8",
    )
    (uninstalled / "Uninstall.exe").write_bytes(b"uninstall residue")
    location = {
        "missing": f'"{tmp_path / "removed"}"',
        "foreign": f'"{foreign}"',
        "relative": "relative-install",
        "malformed": '"C:\\broken"path"',
        "uninstalled": f'"{uninstalled}"',
    }[value]
    assert _invoke(legacy_probe, "registry", location) is None
    assert (foreign / "notes.txt").read_text(encoding="utf-8") == "keep"


def test_powershell_discovery_accepts_ugsci_names_and_skips_stale_records(
    tmp_path,
):
    install = tmp_path / "old UGSci"
    (install / "binaries/state").mkdir(parents=True)
    (install / "binaries/state/active.json").write_text("{}", encoding="utf-8")
    (install / "UGSci.exe").write_bytes(b"legacy")
    uninstalled = tmp_path / "uninstalled"
    uninstalled.mkdir()
    (uninstalled / "version.json").write_text(
        '{"product":"UGSci Desktop"}',
        encoding="utf-8",
    )
    (uninstalled / "Uninstall.exe").write_bytes(b"uninstall residue")
    records = tmp_path / "records.json"
    records.write_text(
        json.dumps(
            [
                {
                    "DisplayName": "UGSci Desktop",
                    "InstallLocation": '"C:\\invalid"path"',
                },
                {
                    "DisplayName": "UGSci",
                    "InstallLocation": str(tmp_path / "removed"),
                },
                {
                    "DisplayName": "UGSci Desktop",
                    "InstallLocation": str(uninstalled),
                },
                {"DisplayName": "UGSci", "InstallLocation": f'"{install}\\"'},
            ],
        ),
        encoding="utf-8",
    )
    builder = BUILDER.read_text(encoding="utf-8")
    normalize = (
        "function Get-NormalizedDirectoryPath"
        + builder.split("function Get-NormalizedDirectoryPath", 1)[1].split(
            "function Test-CurrentProcessElevated",
            1,
        )[0]
    )
    detection = (
        "function Test-ExistingUGSciInstall"
        + builder.split("function Test-ExistingUGSciInstall", 1)[1].split(
            "function Get-UnrelatedInstallEntries",
            1,
        )[0]
    )
    discovery = (
        "$defaultInstallDir = "
        + builder.split("$defaultInstallDir = ", 1)[1].split(
            "$requestedInstallDir = ",
            1,
        )[0]
    )
    script = tmp_path / "discovery.ps1"
    script.write_text(
        "param([string]$Records)\n$ErrorActionPreference = 'Stop'\n"
        "[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)\n"
        "$entries = Get-Content -LiteralPath $Records -Raw "
        "| ConvertFrom-Json\n"
        "function Get-ChildItem { param($Path, $ErrorAction); "
        "for ($i=0;$i -lt $entries.Count;$i++) { "
        "[pscustomobject]@{PSPath=[string]$i; PSChildName=[string]$i} } }\n"
        "function Get-ItemProperty { param($LiteralPath,$ErrorAction); "
        "$entries[[int]$LiteralPath] }\n"
        + normalize
        + detection
        + discovery
        + "\n[ordered]@{location=$existingInstallDir} "
        "| ConvertTo-Json -Compress\n",
        encoding="utf-8-sig",
    )
    result = subprocess.run(
        [
            "powershell.exe",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(script),
            "-Records",
            str(records),
        ],
        capture_output=True,
        text=True,
        encoding="utf-8-sig",
        timeout=30,
        creationflags=subprocess.CREATE_NO_WINDOW,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert json.loads(result.stdout)["location"] == str(install)


def test_update_recovery_accepts_quoted_legacy_snapshot_without_rewriting_it(
    tmp_path,
    legacy_probe,
):
    install = tmp_path / "old UGSci"
    install.mkdir()
    snapshot = f'"{install}\\"'
    transaction = {
        "schema_version": 2,
        "stage": "prepared",
        "install_dir": str(install),
        "backup_dir": str(tmp_path / (".ug-b-" + uuid.uuid4().hex)),
        "previous_uninstall_key_path": (
            "Software\\Microsoft\\Windows\\CurrentVersion\\"
            "Uninstall\\QwenPaw Desktop"
        ),
        "previous_uninstall_values": [
            {
                "name": "DisplayName",
                "kind": "String",
                "value": "QwenPaw Desktop",
            },
            {"name": "InstallLocation", "kind": "String", "value": snapshot},
        ],
    }
    path = tmp_path / "transaction.json"
    path.write_text(json.dumps(transaction), encoding="utf-8")
    original = path.read_bytes()
    result = _invoke(legacy_probe, "transaction", path)
    assert result["install_dir"] == str(install)
    assert json.loads(result["original_snapshot"]) == transaction
    assert path.read_bytes() == original
