# -*- coding: utf-8 -*-
"""Exercise the shipping setup's live diagnostics with real PowerShell."""

from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import sys

import pytest

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "scripts/pack-tauri/windows_portable_bootstrap.cs"
pytestmark = pytest.mark.skipif(
    sys.platform != "win32",
    reason="Requires Windows PowerShell and the desktop .NET Framework",
)

HARNESS = r"""
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Web.Script.Serialization;

internal static class SetupProbe
{
    private static int Main(string[] args)
    {
        Type setup = Assembly.LoadFrom(args[0]).GetType("PortableSetup");
        var stages = new List<string>();
        bool flushedBeforeExit = false;
        Action<string> report = delegate(string stage) {
            stages.Add(stage);
            foreach (string file in Directory.GetFiles(
                Path.GetTempPath(), "ugsci-desktop-setup-*.log"))
                using (var stream = new FileStream(file, FileMode.Open,
                    FileAccess.Read, FileShare.ReadWrite))
                using (var reader = new StreamReader(stream))
                    flushedBeforeExit |= reader.ReadToEnd().Contains(
                        "[UGSCI-INSTALL] " + stage);
        };
        var flags = BindingFlags.NonPublic | BindingFlags.Static;
        object result = setup.GetMethod("RunPowerShell", flags).Invoke(null,
            new object[] { args[1], args[2], new string[0], false, report });
        Type type = result.GetType();
        string log = (string)type.GetField("LogPath").GetValue(result);
        var parser = setup.GetMethod("InstallerStage", flags);
        object ordinary = parser.Invoke(null,
            new object[] { "ordinary output" });
        object blank = parser.Invoke(null,
            new object[] { "[UGSCI-INSTALL]  " });
        string longStage = (string)parser.Invoke(null,
            new object[] { "[UGSCI-INSTALL] " + new string('x', 500) });
        Console.WriteLine(new JavaScriptSerializer().Serialize(new {
            exit_code = type.GetField("ExitCode").GetValue(result),
            stages = stages,
            flushed_before_exit = flushedBeforeExit,
            log = File.ReadAllText(log),
            ordinary = ordinary,
            blank = blank,
            long_stage_length = longStage.Length
        }));
        return 0;
    }
}
"""


def test_setup_streams_stages_and_failure_log_before_process_exit(
    tmp_path: Path,
) -> None:
    compiler = (
        Path(os.environ["WINDIR"])
        / "Microsoft.NET/Framework64/v4.0.30319/csc.exe"
    )
    assert compiler.is_file(), "Windows desktop validation requires csc.exe"
    harness = tmp_path / "probe.cs"
    harness.write_text(HARNESS, encoding="utf-8")
    assembly, probe = tmp_path / "setup.dll", tmp_path / "probe.exe"
    for output, source, target in (
        (assembly, SOURCE, "library"),
        (probe, harness, "exe"),
    ):
        result = subprocess.run(
            [
                str(compiler),
                "/nologo",
                "/optimize+",
                f"/target:{target}",
                f"/out:{output}",
                "/reference:System.dll",
                "/reference:System.Core.dll",
                "/reference:System.Drawing.dll",
                "/reference:System.Windows.Forms.dll",
                "/reference:System.Web.Extensions.dll",
                str(source),
            ],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        assert result.returncode == 0, result.stdout + result.stderr
    script = tmp_path / "install.ps1"
    script.write_text(
        "[Console]::OutputEncoding = New-Object Text.UTF8Encoding($false)\n"
        "Write-Host '[UGSCI-INSTALL] Copying application files...'\n"
        "Start-Sleep -Milliseconds 200\n"
        "[Console]::Error.WriteLine('copy failed: diagnostic retained')\n"
        "Write-Host 'ordinary output'\n"
        "exit 7\n",
        encoding="utf-8-sig",
    )
    result = subprocess.run(
        [str(probe), str(assembly), str(tmp_path), str(script)],
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
        env={**os.environ, "TEMP": str(tmp_path), "TMP": str(tmp_path)},
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    report = json.loads(result.stdout)
    assert report["exit_code"] == 7
    assert report["stages"] == ["Copying application files..."]
    assert report["flushed_before_exit"] is True
    assert "[stderr] copy failed: diagnostic retained" in report["log"]
    assert "[stdout] ordinary output" in report["log"]
    assert "Process exited with code 7." in report["log"]
    assert report["ordinary"] is None
    assert report["blank"] is None
    assert report["long_stage_length"] == 240
