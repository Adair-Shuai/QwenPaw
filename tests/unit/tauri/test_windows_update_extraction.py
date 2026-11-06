# -*- coding: utf-8 -*-
"""Execute the real Windows update extractor without opening installer UI."""
from __future__ import annotations

import json
import math
import os
from pathlib import Path
import subprocess
import sys
import zipfile

import pytest

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "scripts/pack-tauri/windows_update_assistant.cs"
pytestmark = pytest.mark.skipif(
    sys.platform != "win32",
    reason="Requires the desktop Windows .NET Framework runtime",
)
REFERENCES = (
    "System.dll",
    "System.Core.dll",
    "System.Drawing.dll",
    "System.Windows.Forms.dll",
    "System.IO.Compression.dll",
    "System.IO.Compression.FileSystem.dll",
    "System.Web.Extensions.dll",
)
HARNESS = r"""
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Web.Script.Serialization;

internal static class ExtractorProbe
{
    private static int Main(string[] args)
    {
        var assembly = Assembly.LoadFrom(args[0]);
        var owner = assembly.GetType("UGSciUpdateAssistant").GetNestedType(
            "UpdateForm", BindingFlags.NonPublic);
        var method = owner.GetMethod("ExtractSafely",
            BindingFlags.NonPublic | BindingFlags.Static);
        var progress = new List<int>();
        Action<int, string> report = delegate(int percent, string name) {
            progress.Add(percent);
        };
        var before = GC.GetAllocatedBytesForCurrentThread();
        int gen2 = GC.CollectionCount(2);
        var clock = Stopwatch.StartNew();
        string failure = null;
        try { method.Invoke(null, new object[] { args[1], args[2], report }); }
        catch (TargetInvocationException error) {
            failure = error.InnerException.GetType().Name + ": "
                + error.InnerException.Message;
        }
        clock.Stop();
        var result = new {
            allocated_bytes = GC.GetAllocatedBytesForCurrentThread() - before,
            gen2_collections = GC.CollectionCount(2) - gen2,
            elapsed_ms = clock.Elapsed.TotalMilliseconds,
            progress = progress,
            error = failure
        };
        Console.WriteLine(new JavaScriptSerializer().Serialize(result));
        return failure == null ? 0 : 2;
    }
}
"""


def compile_extractor(
    directory: Path,
    source: Path = SOURCE,
) -> tuple[Path, Path]:
    """Compile the shipping assistant and a probe that opens no UI."""
    framework = Path(os.environ["WINDIR"]) / "Microsoft.NET"
    compiler = next(
        (
            framework / arch / "v4.0.30319/csc.exe"
            for arch in ("Framework64", "Framework")
            if (framework / arch / "v4.0.30319/csc.exe").is_file()
        ),
        None,
    )
    assert compiler is not None, "Windows desktop build requires csc.exe"
    directory.mkdir(parents=True, exist_ok=True)
    assembly, probe = directory / "assistant.dll", directory / "probe.exe"
    harness = directory / "probe.cs"
    harness.write_text(HARNESS, encoding="utf-8")
    for output, target, inputs in (
        (assembly, "library", source),
        (probe, "exe", harness),
    ):
        result = subprocess.run(
            [
                str(compiler),
                "/nologo",
                "/optimize+",
                f"/target:{target}",
                f"/out:{output}",
                *(f"/reference:{name}" for name in REFERENCES),
                str(inputs),
            ],
            capture_output=True,
            text=True,
            check=False,
            timeout=60,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        assert result.returncode == 0, result.stdout + result.stderr
    return probe, assembly


def run_extractor(
    compiled: tuple[Path, Path],
    archive: Path,
    destination: Path,
) -> tuple[int, dict]:
    probe, assembly = compiled
    destination.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        [str(probe), str(assembly), str(archive), str(destination)],
        capture_output=True,
        text=True,
        check=False,
        timeout=60,
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    return result.returncode, json.loads(result.stdout)


@pytest.fixture(scope="module", name="compiled_extractor")
def _compiled_extractor(tmp_path_factory):
    return compile_extractor(tmp_path_factory.mktemp("update-extractor"))


def test_extractor_reuses_buffer_and_limits_progress_for_many_files(
    tmp_path,
    compiled_extractor,
):
    archive, destination = tmp_path / "package.zip", tmp_path / "out"
    files = {
        f"packages/group-{index % 16}/file-{index}.py": (
            f"VALUE = {index}\n".encode() * 32
        )
        for index in range(512)
    }
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as output:
        for name, payload in files.items():
            output.writestr(name, payload)
    code, result = run_extractor(compiled_extractor, archive, destination)
    assert code == 0, result
    assert result["error"] is None
    assert result["progress"] == sorted(result["progress"])
    assert result["progress"][-1] == 100
    assert len(result["progress"]) <= math.ceil(result["elapsed_ms"] / 100) + 2
    # A separate 1 MiB buffer per file would allocate over 512 MiB. Allow
    # generous per-entry metadata overhead without testing wall-clock speed.
    assert result["allocated_bytes"] < len(files) * 256 * 1024
    actual = {
        path.relative_to(destination).as_posix(): path.read_bytes()
        for path in destination.rglob("*")
        if path.is_file()
    }
    assert actual == files


@pytest.mark.parametrize("members", [[], ["empty/", "empty/file.txt"]])
def test_extractor_reports_completion_for_empty_payloads(
    tmp_path,
    compiled_extractor,
    members,
):
    archive, destination = tmp_path / "empty.zip", tmp_path / "out"
    with zipfile.ZipFile(archive, "w") as output:
        for name in members:
            output.writestr(name, b"")
    code, result = run_extractor(compiled_extractor, archive, destination)
    assert code == 0, result
    assert result["progress"] == [100]
    if members:
        assert (destination / "empty/file.txt").read_bytes() == b""


@pytest.mark.parametrize(
    "name",
    ["../escape.txt", "/absolute.txt", "file.txt:stream", "a/./alias.txt"],
)
def test_extractor_keeps_unsafe_path_rejection(
    tmp_path,
    compiled_extractor,
    name,
):
    archive, destination = tmp_path / "unsafe.zip", tmp_path / "out"
    with zipfile.ZipFile(archive, "w") as output:
        output.writestr(name, b"untrusted")
    code, result = run_extractor(compiled_extractor, archive, destination)
    assert code == 2
    assert "Unsafe" in result["error"]
    assert result["progress"] == []
    assert not list(destination.rglob("*"))
    assert not (tmp_path / "escape.txt").exists()


def test_extractor_rejects_links_and_preserves_existing_files(
    tmp_path,
    compiled_extractor,
):
    archive, destination = tmp_path / "links.zip", tmp_path / "out"
    link = zipfile.ZipInfo("link")
    link.create_system = 3
    link.external_attr = 0o120777 << 16
    with zipfile.ZipFile(archive, "w") as output:
        output.writestr(link, "outside")
    code, result = run_extractor(compiled_extractor, archive, destination)
    assert code == 2
    assert "symbolic links" in result["error"]
    assert result["progress"] == []
    (destination / "existing.txt").write_bytes(b"preserve me")
    with zipfile.ZipFile(archive, "w") as output:
        output.writestr("existing.txt", b"replacement")
    code, result = run_extractor(compiled_extractor, archive, destination)
    assert code == 2
    assert "Duplicate" in result["error"]
    assert (destination / "existing.txt").read_bytes() == b"preserve me"


def test_extractor_does_not_report_success_before_later_invalid_entry(
    tmp_path,
    compiled_extractor,
):
    archive, destination = tmp_path / "late-invalid.zip", tmp_path / "out"
    with zipfile.ZipFile(archive, "w") as output:
        output.writestr("valid.txt", b"all nonempty payload")
        output.writestr("../escape.txt", b"")
    code, result = run_extractor(compiled_extractor, archive, destination)
    assert code == 2
    assert "Unsafe" in result["error"]
    assert result["progress"] and max(result["progress"]) < 100
    assert not (tmp_path / "escape.txt").exists()
