# -*- coding: utf-8 -*-
"""Execute WebView setup functions with isolated OS/network boundaries."""
from __future__ import annotations

import json
import http.server
import os
from pathlib import Path
import subprocess
import sys
import threading

import pytest

ROOT = Path(__file__).resolve().parents[3]
BUILDER = ROOT / "scripts/pack-tauri/create_windows_portable_installer.ps1"
STANDALONE = "MicrosoftEdgeWebView2RuntimeInstallerX64.exe"
BOOTSTRAPPER = "MicrosoftEdgeWebview2Setup.exe"
pytestmark = pytest.mark.skipif(
    sys.platform != "win32",
    reason="Exercises shipping Windows PowerShell setup functions",
)
BOUNDARIES = r"""
$script:remaining = 300000
$script:installed = $scenario -eq 'installed'
$script:launches = [Collections.Generic.List[string]]::new()
$script:waits = [Collections.Generic.List[int]]::new()
$script:sleeps = [Collections.Generic.List[int]]::new()
$script:downloads = [Collections.Generic.List[int]]::new()
$script:signatures = [Collections.Generic.List[string]]::new()
$script:copies = 0
$script:kills = 0
function Get-WebView2RemainingMilliseconds { return $script:remaining }
function Get-ItemProperty {
  param($LiteralPath, $Name, $ErrorAction)
  return @{ pv = $(if ($script:installed) { '1.2.3.4' } else { '0.0.0.0' }) }
}
function Get-AuthenticodeSignature {
  param($FilePath)
  $script:signatures.Add($FilePath)
  if ($scenario -eq 'signature-budget') { $script:remaining = 0 }
  return @{
    Status = $(if ($scenario -eq 'bad-signature') { 'NotTrusted' }
      else { 'Valid' })
    SignerCertificate = @{
      Subject = $(if ($scenario -eq 'wrong-signer') { 'CN=Other Publisher' }
        else { 'CN=Microsoft Corporation' })
    }
  }
}
function Start-Process {
  param($FilePath, $ArgumentList, [switch]$PassThru, $WindowStyle)
  if ($WindowStyle -ne 'Hidden') { throw 'Installer must launch hidden' }
  $script:launches.Add($FilePath)
  $process = [pscustomobject]@{ Id = 12345; ExitCode = 0; File = $FilePath }
  $process | Add-Member ScriptMethod WaitForExit {
    param($Milliseconds)
    $script:waits.Add($Milliseconds)
    if ($scenario -in @('timeout', 'timeout-registered')) {
      $script:remaining = 0
      return $false
    }
    if ($scenario -eq 'registration-budget') {
      $script:remaining = 750
      return $true
    }
    if ($scenario -eq 'all-fail' -or
        ($scenario -in @('fallback', 'download', 'download-budget',
          'short-download', 'no-download-budget') -and
         $this.File.EndsWith('RuntimeInstallerX64.exe'))) {
      $script:remaining = switch ($scenario) {
        'short-download' { 1250 }
        'no-download-budget' { 0 }
        default { 200000 }
      }
      $this.ExitCode = 21
      return $true
    }
    $script:remaining -= [Math]::Min(1000, $Milliseconds)
    $script:installed = $true
    return $true
  }
  $process | Add-Member ScriptMethod Dispose { }
  return $process
}
function Stop-Process {
  param($Id, [switch]$Force, $ErrorAction)
  $script:kills++
  if ($scenario -eq 'timeout-registered') { $script:installed = $true }
}
function Start-Sleep {
  param([int]$Milliseconds)
  $script:sleeps.Add($Milliseconds)
  $script:remaining -= $Milliseconds
}
function Save-WebView2Bootstrapper {
  param($Destination, [int]$TimeoutMilliseconds)
  $script:downloads.Add($TimeoutMilliseconds)
  [IO.File]::WriteAllText($Destination, 'download fixture')
  if ($scenario -eq 'download-budget') { $script:remaining = 0 }
  else { $script:remaining -= 1000 }
}
function Copy-Item {
  param($LiteralPath, $Destination, [switch]$Force)
  $script:copies++
  [IO.File]::Copy($LiteralPath, $Destination, $true)
}
Ensure-WebView2 -DestinationDir $destination
[ordered]@{
  launches = $script:launches.ToArray()
  waits = $script:waits.ToArray()
  sleeps = $script:sleeps.ToArray()
  downloads = $script:downloads.ToArray()
  signatures = $script:signatures.ToArray()
  copies = $script:copies
  kills = $script:kills
  marker = [IO.File]::Exists((Join-Path $destination 'webview2-missing.txt'))
} | ConvertTo-Json -Compress
"""


def _run(tmp_path, scenario, *, bootstrap=True, destination_copy=True):
    payload, destination = tmp_path / "payload", tmp_path / "destination"
    payload.mkdir()
    destination.mkdir()
    for name in [STANDALONE] + ([BOOTSTRAPPER] if bootstrap else []):
        (payload / name).write_bytes(b"installer fixture")
        if destination_copy:
            (destination / name).write_bytes(b"installer fixture")
    (destination / "webview2-missing.txt").write_text(
        "stale",
        encoding="utf-8",
    )
    builder = BUILDER.read_text(encoding="utf-8")
    functions = (
        "function Test-WebView2RuntimeInstalled {"
        + builder.split(
            "function Test-WebView2RuntimeInstalled {",
            1,
        )[
            1
        ].split("\nif (-not (Test-Path $payloadRoot))", 1)[0]
    )
    script = tmp_path / "probe.ps1"
    script.write_text(
        "$ErrorActionPreference = 'Stop'\n"
        "[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)\n"
        f"$scenario = '{scenario}'\n"
        f"$payloadRoot = '{payload}'\n$destination = '{destination}'\n"
        + functions
        + "\n"
        + BOUNDARIES,
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
        encoding="utf-8",
        timeout=20,
        check=False,
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    return json.loads(completed.stdout.splitlines()[-1]), completed.stdout


def test_webview_existing_runtime_skips_copy_launch_download_and_clears_marker(
    tmp_path,
):
    result, log = _run(tmp_path, "installed")
    assert (
        result["launches"] == result["downloads"] == result["signatures"] == []
    )
    assert result["copies"] == 0
    assert not result["marker"]
    assert "already installed" in log


@pytest.mark.parametrize("destination_copy", [False, True])
def test_webview_offline_success_uses_one_copy_and_never_downloads(
    tmp_path,
    destination_copy,
):
    result, _ = _run(tmp_path, "offline", destination_copy=destination_copy)
    expected_root = "destination" if destination_copy else "payload"
    assert result["launches"] == [str(tmp_path / expected_root / STANDALONE)]
    assert result["downloads"] == []
    assert result["copies"] == 0
    assert not result["marker"]


def test_webview_offline_failure_attempts_only_one_online_fallback(tmp_path):
    result, log = _run(tmp_path, "fallback")
    assert result["launches"] == [
        str(tmp_path / "destination" / name)
        for name in (STANDALONE, BOOTSTRAPPER)
    ]
    assert result["waits"] == [300000, 200000]
    assert result["downloads"] == []
    assert result["copies"] == 0
    assert not result["marker"]
    assert "Offline WebView2 installer failed:" in log
    assert "exit 21" in log


@pytest.mark.parametrize("registered", [False, True])
def test_webview_shared_timeout_prevents_retry_and_rechecks_registration(
    tmp_path,
    registered,
):
    scenario = "timeout-registered" if registered else "timeout"
    result, log = _run(tmp_path, scenario)
    assert len(result["launches"]) == 1
    assert result["downloads"] == []
    assert result["kills"] == 1
    assert result["marker"] is not registered
    if not registered:
        assert "shared wait budget exhausted" in log


def test_webview_registration_polling_uses_remaining_shared_budget(tmp_path):
    result, log = _run(tmp_path, "registration-budget")
    assert result["sleeps"] == [750]
    assert len(result["launches"]) == 1
    assert result["downloads"] == []
    assert result["marker"]
    assert "registration timed out" in log


@pytest.mark.parametrize("scenario", ["bad-signature", "wrong-signer"])
def test_webview_rejects_invalid_microsoft_signature_before_launch(
    tmp_path,
    scenario,
):
    result, log = _run(tmp_path, scenario)
    assert len(result["signatures"]) == 2
    assert result["launches"] == result["downloads"] == []
    assert result["marker"]
    assert "does not have a valid Microsoft signature" in log


def test_webview_failure_is_visible_and_preserves_missing_marker(tmp_path):
    result, log = _run(tmp_path, "all-fail")
    assert len(result["launches"]) == 2
    assert result["downloads"] == []
    assert result["marker"]
    assert "Online WebView2 fallback failed:" in log
    assert "exit 21" in log
    assert "Setup will continue" in log


@pytest.mark.parametrize(
    "scenario, downloads, starts, copied",
    [
        ("download", [120000], 2, 1),
        ("download-budget", [120000], 1, 0),
        ("short-download", [1250], 2, 1),
        ("no-download-budget", [], 1, 0),
        ("signature-budget", [], 0, 0),
    ],
)
def test_webview_download_and_signature_share_budget_without_extra_attempts(
    tmp_path,
    scenario,
    downloads,
    starts,
    copied,
):
    result, _ = _run(tmp_path, scenario, bootstrap=False)
    assert result["downloads"] == downloads
    assert len(result["launches"]) == starts
    assert result["copies"] == copied
    assert result["marker"] is (copied == 0)
    if scenario == "short-download":
        assert result["waits"] == [300000, 250]


def test_fresh_install_without_existing_data_does_not_enter_backup_phase():
    script = BUILDER.read_text(encoding="utf-8")
    plan = script.split("$backupPlan = if (", 1)[1].split(
        "# Counted from",
        1,
    )[0]
    assert "$existingInstallDir -or $hasExistingUserData" in plan
    assert "else { $null }" in plan
    operation = script.split("$dataBackup = $null", 1)[1].split(
        'Start-InstallerPhase "Checking WebView2 runtime"',
        1,
    )[0]
    gate = operation.index(
        "if ($backupPlan -and [int64]$backupPlan.TotalBytes -gt 0)",
    )
    start = operation.index('Start-InstallerPhase "Backing up user data"')
    copy = operation.index("$dataBackup = New-UpdateDataBackup")
    otherwise = operation.index("} else {")
    assert gate < start < copy < otherwise
    assert "No existing user data requires backup" in operation[otherwise:]
    assert "New-UpdateDataBackup" not in operation[otherwise:]


def test_webview_real_budget_clock_decreases_and_expiry_clamps_to_zero(
    tmp_path,
):
    source = BUILDER.read_text(encoding="utf-8")
    function = (
        "function Get-WebView2RemainingMilliseconds {"
        + source.split(
            "function Get-WebView2RemainingMilliseconds {",
            1,
        )[
            1
        ].split("\nfunction Install-WebView2Runtime", 1)[0]
    )
    script = tmp_path / "clock.ps1"
    script.write_text(
        "$ErrorActionPreference = 'Stop'\n" + function + "\n"
        "$script:webView2Budget = [Diagnostics.Stopwatch]::StartNew()\n"
        "$before = Get-WebView2RemainingMilliseconds\n"
        "Start-Sleep -Milliseconds 25\n"
        "$after = Get-WebView2RemainingMilliseconds\n"
        "$script:webView2Budget = [pscustomobject]@{"
        " ElapsedMilliseconds = 350000 }\n"
        "$expired = Get-WebView2RemainingMilliseconds\n"
        "@{before=$before; after=$after; expired=$expired} | ConvertTo-Json\n",
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
        timeout=20,
        check=False,
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    result = json.loads(completed.stdout)
    assert 0 <= result["after"] < result["before"] <= 300000
    assert result["expired"] == 0


def test_webview_real_download_cancels_slow_body_without_launching_installer(
    tmp_path,
):
    request_started = threading.Event()
    finish_response = threading.Event()

    class SlowBody(http.server.BaseHTTPRequestHandler):
        def do_GET(self):  # pylint: disable=invalid-name
            self.send_response(200)
            self.send_header("Content-Length", "10")
            self.end_headers()
            self.wfile.write(b"x")
            self.wfile.flush()
            request_started.set()
            # An ordinary header/read timeout does not bound this response.
            finish_response.wait(4)
            try:
                self.wfile.write(b"123456789")
                self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError, OSError):
                pass

        def log_message(
            self,
            format,
            *args,
        ):  # pylint: disable=redefined-builtin
            pass

    payload, destination = tmp_path / "payload", tmp_path / "destination"
    payload.mkdir()
    destination.mkdir()
    source = BUILDER.read_text(encoding="utf-8")
    functions = (
        "function Test-WebView2RuntimeInstalled {"
        + source.split(
            "function Test-WebView2RuntimeInstalled {",
            1,
        )[
            1
        ].split("\nif (-not (Test-Path $payloadRoot))", 1)[0]
    )
    with http.server.ThreadingHTTPServer(("127.0.0.1", 0), SlowBody) as server:
        server.daemon_threads = True
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        script = tmp_path / "download.ps1"
        url = f"http://127.0.0.1:{server.server_port}/installer.exe"
        script.write_text(
            "$ErrorActionPreference = 'Stop'\n"
            f"$payloadRoot = '{payload}'\n" + functions + "\n"
            "$script:download = ${function:Save-WebView2Bootstrapper}\n"
            "function Save-WebView2Bootstrapper {\n"
            "  param($Destination, $TimeoutMilliseconds)\n"
            "  & $script:download -Destination $Destination "
            f"-TimeoutMilliseconds $TimeoutMilliseconds -Uri '{url}'\n"
            "}\n"
            "function Get-WebView2RemainingMilliseconds { return 500 }\n"
            "function Get-ItemProperty { param($LiteralPath, $Name, "
            "$ErrorAction); return @{pv='0.0.0.0'} }\n"
            "$script:launches = 0; $script:signatures = 0\n"
            "function Start-Process { $script:launches++; "
            "throw 'Incomplete download must not launch' }\n"
            "function Get-AuthenticodeSignature { $script:signatures++; "
            "throw 'Incomplete download must not reach signature stage' }\n"
            "$clock = [Diagnostics.Stopwatch]::StartNew()\n"
            f"Ensure-WebView2 -DestinationDir '{destination}'\n"
            "@{ elapsed = $clock.Elapsed.TotalSeconds; "
            "launches = $script:launches; signatures = $script:signatures; "
            "marker = [IO.File]::Exists("
            f"'{destination / 'webview2-missing.txt'}') "
            "} | ConvertTo-Json -Compress\n",
            encoding="utf-8-sig",
        )
        try:
            completed = subprocess.run(
                [
                    "powershell.exe",
                    "-NoProfile",
                    "-NonInteractive",
                    "-File",
                    str(script),
                ],
                env={**os.environ, "TEMP": str(tmp_path)},
                capture_output=True,
                text=True,
                timeout=15,
                check=False,
                creationflags=subprocess.CREATE_NO_WINDOW,
            )
            assert completed.returncode == 0, (
                completed.stdout + completed.stderr
            )
            assert request_started.is_set()
            result = json.loads(completed.stdout.splitlines()[-1])
            assert 0.3 <= result["elapsed"] < 3.5, result
            assert result["launches"] == result["signatures"] == 0
            assert result["marker"]
            assert "download timed out" in completed.stdout
            assert not list(tmp_path.glob("MicrosoftEdgeWebview2Setup-*.exe"))
        finally:
            finish_response.set()
            server.shutdown()
            worker.join(timeout=5)
