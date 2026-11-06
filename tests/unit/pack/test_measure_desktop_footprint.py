# -*- coding: utf-8 -*-
"""Exercise footprint reports and cleanup with isolated real processes."""

from __future__ import annotations

import csv
import importlib.util
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import textwrap

import psutil
import pytest

ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "scripts" / "measure_desktop_footprint.py"
SPEC = importlib.util.spec_from_file_location("desktop_footprint", SCRIPT)
assert SPEC is not None and SPEC.loader is not None
FOOTPRINT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(FOOTPRINT)


def _run(*arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *arguments],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=30,
        check=False,
    )


def _free_port() -> int:
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        return listener.getsockname()[1]


def _make_link(link: Path, target: Path) -> None:
    if os.name == "nt":
        subprocess.run(
            ["cmd", "/c", "mklink", "/J", str(link), str(target)],
            check=True,
            capture_output=True,
        )
    else:
        link.symlink_to(target, target_is_directory=True)


def test_directory_measurement_counts_actual_bytes_and_never_starts(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture,
) -> None:
    installation = tmp_path / "installation"
    (installation / "runtime" / "nested").mkdir(parents=True)
    (installation / "runtime" / "nested" / "binary.dat").write_bytes(b"x" * 19)
    (installation / "runtime" / "settings.json").write_bytes(b"abc")
    (installation / "launcher.exe").write_bytes(b"12345")

    def refuse_launch(*_args, **_kwargs):
        pytest.fail("Directory-only measurement attempted to start a process")

    monkeypatch.setattr(subprocess, "Popen", refuse_launch)
    result = FOOTPRINT.main(["--root", str(installation)])

    report = json.loads(capsys.readouterr().out)
    assert result == 0
    assert report["launch"] is None
    assert report["directories"][0]["logical_bytes"] == 27
    assert report["directories"][0]["file_count"] == 3
    assert report["directories"][0]["top_level"] == [
        {"name": "runtime", "logical_bytes": 22, "file_count": 2},
        {"name": "launcher.exe", "logical_bytes": 5, "file_count": 1},
    ]
    assert (installation / "runtime" / "settings.json").read_bytes() == b"abc"


def test_directory_links_are_reported_and_not_followed(tmp_path: Path) -> None:
    root = tmp_path / "installation"
    root.mkdir()
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "not-ours.bin").write_bytes(b"x" * 8192)
    (root / "ours.bin").write_bytes(b"abc")
    link = root / "linked-directory"
    _make_link(link, outside)
    try:
        result = _run("--root", str(root))
        report = json.loads(result.stdout)
        assert result.returncode == 0, result.stderr
        assert report["directories"][0]["logical_bytes"] == 3
        assert report["directories"][0]["skipped_links"] == [
            "linked-directory",
        ]
        refused = _run("--root", str(link))
        assert refused.returncode == 1
        linked_report = json.loads(refused.stdout)["directories"][0]
        assert linked_report["logical_bytes"] == 0
        assert "contains a link" in linked_report["errors"][0]
    finally:
        if os.name == "nt":
            link.rmdir()
        else:
            link.unlink()
    assert (outside / "not-ours.bin").stat().st_size == 8192


def test_distribution_sizes_use_real_record_files_and_boundaries(
    tmp_path: Path,
) -> None:
    site = tmp_path / "site-packages"
    package = site / "package"
    package.mkdir(parents=True)
    (package / "a.py").write_bytes(b"a" * 11)
    (package / "b.py").write_bytes(b"b" * 7)
    (site / "unowned.dat").write_bytes(b"z" * 5)
    (tmp_path / "external.dat").write_bytes(b"x" * 100)
    for name, records in [
        (
            "example",
            ["package/a.py", "package/a.py", "../external.dat", "missing.py"],
        ),
        ("shared", ["package/a.py", "package/b.py"]),
    ]:
        metadata = site / f"{name}-1.0.dist-info"
        metadata.mkdir()
        (metadata / "METADATA").write_text(
            f"Name: {name}\nVersion: 1.0\n",
            encoding="utf-8",
        )
        with (metadata / "RECORD").open(
            "w",
            newline="",
            encoding="utf-8",
        ) as record:
            csv.writer(record).writerows([[item, "", ""] for item in records])
    unknown = site / "unknown-2.0.dist-info"
    unknown.mkdir()
    (unknown / "METADATA").write_text("Name: unknown\n", encoding="utf-8")

    result = _run("--site-packages", str(site))
    assert result.returncode == 0, result.stderr
    report = json.loads(result.stdout)["site_packages"][0]
    packages = {item["name"]: item for item in report["distributions"]}
    assert packages["example"]["logical_bytes"] == 11
    assert packages["example"]["file_count"] == 1
    assert packages["example"]["outside_site_packages"] == ["../external.dat"]
    assert packages["example"]["missing_or_excluded_files"] == ["missing.py"]
    assert packages["shared"]["logical_bytes"] == 18
    assert packages["unknown"]["logical_bytes"] is None
    assert "No regular in-root RECORD" in packages["unknown"]["errors"][0]
    assert report["attributed_unique_bytes"] == 18
    assert report["shared_record_file_count"] == 1
    assert report["unattributed_bytes"] == report["logical_bytes"] - 18


@pytest.fixture(name="launch_service")
def _launch_service(tmp_path: Path):
    """Create a real loopback server which owns a long-lived grandchild."""
    script = tmp_path / "isolated_server.py"
    script.write_text(
        textwrap.dedent(
            """
            from http.server import BaseHTTPRequestHandler, HTTPServer
            from pathlib import Path
            import os
            import subprocess
            import sys
            import threading
            import time

            mode, port = sys.argv[1], int(sys.argv[2])
            marker = Path(sys.argv[3])
            child = subprocess.Popen(
                [sys.executable, '-c', 'import time; time.sleep(120)'],
                stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            marker.write_text(str(child.pid), encoding='ascii')
            if mode == 'exit':
                sys.exit(7)
            if mode == 'timeout':
                time.sleep(120)
            class Handler(BaseHTTPRequestHandler):
                def do_GET(self):
                    if self.path == '/should-not-follow':
                        (marker.parent / 'redirected').touch()
                    elif mode == 'redirect':
                        self.send_response(302)
                        self.send_header('Location', '/should-not-follow')
                        self.end_headers()
                        return
                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b'ok')
                def log_message(self, *args):
                    pass
            time.sleep(0.15)
            server = HTTPServer(('127.0.0.1', port), Handler)
            if mode == 'exit-after-ready':
                thread = threading.Thread(
                    target=server.serve_forever, daemon=True,
                )
                thread.start()
                time.sleep(0.3)
                os._exit(9)
            server.serve_forever()
            """,
        ),
        encoding="utf-8",
    )
    marker = tmp_path / "grandchild.pid"
    output = tmp_path / "report.json"
    port = _free_port()

    def run(mode: str, *, idle: str = "0.1", timeout: str = "5"):
        return _run(
            "--health-url",
            f"http://127.0.0.1:{port}/healthz",
            "--startup-timeout",
            timeout,
            "--idle-seconds",
            idle,
            "--poll-interval",
            "0.05",
            "--rss-samples",
            "2",
            "--sample-interval",
            "0.05",
            "--cache-state",
            "first-launch",
            "--output",
            str(output),
            "--command",
            sys.executable,
            str(script),
            mode,
            str(port),
            str(marker),
        )

    yield run, marker, output
    # A failing assertion must not itself leave a fixture process behind.
    if marker.exists():
        child_pid = int(marker.read_text(encoding="ascii"))
        if psutil.pid_exists(child_pid):
            child = psutil.Process(child_pid)
            if "time.sleep(120)" in " ".join(child.cmdline()):
                child.kill()
                child.wait(timeout=5)


def test_real_startup_rss_and_owned_tree_cleanup(launch_service) -> None:
    run, marker, output = launch_service
    # Keep this separate process alive through measurement, then stop it below.
    sibling = subprocess.Popen(  # pylint: disable=consider-using-with
        [sys.executable, "-c", "import time; time.sleep(120)"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        result = run("ready")
        assert result.returncode == 0, result.stdout + result.stderr
        report = json.loads(output.read_text(encoding="utf-8"))
        assert report == json.loads(result.stdout)
        launch = report["launch"]
        assert launch["status"] == "ready"
        assert 0.1 <= launch["startup_seconds"] < 5
        assert launch["rss_bytes"]["median"] > 0
        assert all(
            sample["process_count"] >= 2 for sample in launch["samples"]
        )
        assert launch["cleanup"]["remaining_pids"] == []
        assert launch["cleanup"]["errors"] == []
        assert "not flushed" in launch["cache_note"]
        assert "shared pages" in launch["rss_note"]
        assert not psutil.pid_exists(int(marker.read_text(encoding="ascii")))
        assert sibling.poll() is None
    finally:
        sibling.terminate()
        sibling.wait(timeout=5)


@pytest.mark.parametrize(
    ("mode", "idle", "timeout", "error"),
    [
        ("timeout", "0", "0.5", "Readiness timeout"),
        ("redirect", "0", "1.5", "Readiness timeout"),
        ("exit", "0", "5", "exited with code 7"),
        ("exit-after-ready", "1", "5", "exited with code 9"),
    ],
)
def test_failed_launch_writes_report_and_reaps_descendants(
    launch_service,
    mode: str,
    idle: str,
    timeout: str,
    error: str,
) -> None:
    run, marker, output = launch_service
    result = run(mode, idle=idle, timeout=timeout)
    assert result.returncode == 1, result.stdout + result.stderr
    report = json.loads(output.read_text(encoding="utf-8"))
    launch = report["launch"]
    assert report["status"] == "failed"
    assert error in launch["error"]
    assert launch["cleanup"]["remaining_pids"] == []
    assert not psutil.pid_exists(int(marker.read_text(encoding="ascii")))
    assert not (marker.parent / "redirected").exists()


def test_preexisting_listener_is_not_used_or_terminated(
    tmp_path: Path,
) -> None:
    marker = tmp_path / "must-not-run"
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        listener.listen()
        port = listener.getsockname()[1]
        result = _run(
            "--health-url",
            f"http://127.0.0.1:{port}/healthz",
            "--command",
            sys.executable,
            "-c",
            f"from pathlib import Path; Path({str(marker)!r}).touch()",
        )
        assert result.returncode == 1
        assert not marker.exists()
        assert (
            "already has a listener"
            in json.loads(result.stdout)["launch"]["error"]
        )
        assert listener.getsockname()[1] == port


@pytest.mark.parametrize(
    "url",
    [
        "https://example.com/health",
        "http://192.168.1.1/",
        "file:///tmp/health",
    ],
)
def test_non_loopback_health_urls_are_rejected_before_launch(
    tmp_path: Path,
    url: str,
) -> None:
    marker = tmp_path / "must-not-run"
    result = _run(
        "--health-url",
        url,
        "--command",
        sys.executable,
        "-c",
        f"from pathlib import Path; Path({str(marker)!r}).touch()",
    )
    assert result.returncode == 1
    assert json.loads(result.stdout)["launch"]["status"] == "failed"
    assert not marker.exists()
