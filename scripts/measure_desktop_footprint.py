# -*- coding: utf-8 -*-
"""Measure desktop files and, only on request, an isolated server launch.

Examples (put --command last; it is an argv list, never a shell string)::

    python scripts/measure_desktop_footprint.py --root dist --output size.json
    python scripts/measure_desktop_footprint.py --root runtime \
        --site-packages runtime/Lib/site-packages --output baseline.json
    python scripts/measure_desktop_footprint.py --health-url \
        http://127.0.0.1:18791/healthz --cache-state first-launch \
        --output launch.json --command python -m example_server

Directory measurements use logical file lengths, not allocated disk blocks or
download sizes. Links/reparse points are excluded. Distribution attribution uses
RECORD files within the explicitly supplied site-packages directory; it does
not import installed packages. Launch measurements require psutil. They do not
flush OS caches, configure the app, or send work to it. The operator must choose
an isolated application configuration and a dedicated, unused loopback port.
"""

from __future__ import annotations

import argparse
import csv
import ctypes
from datetime import datetime, timezone
from email.parser import Parser
import ipaddress
import json
import math
import os
from pathlib import Path, PurePosixPath, PureWindowsPath
import platform
import signal
import socket
import stat
import statistics
import subprocess
import sys
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, urlunsplit
from urllib.request import (
    HTTPRedirectHandler,
    ProxyHandler,
    Request,
    build_opener,
)


def _is_link(info: os.stat_result) -> bool:
    return stat.S_ISLNK(info.st_mode) or bool(
        getattr(info, "st_file_attributes", 0)
        & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400),
    )


def _plain_directory(path: Path) -> Path:
    """Reject links before resolving them, including links in input parents."""
    absolute = Path(os.path.abspath(path))
    for part in reversed((absolute, *absolute.parents)):
        if _is_link(part.lstat()):
            raise ValueError(f"Directory path contains a link: {part}")
    if not absolute.is_dir():
        raise ValueError(f"Not a directory: {absolute}")
    return absolute


def measure_directory(
    path: Path,
    *,
    collect_files: bool = False,
) -> tuple[dict[str, Any], dict[str, int]]:
    """Return a read-only logical-size report and an optional relative index."""
    report: dict[str, Any] = {
        "path": str(Path(os.path.abspath(path))),
        "logical_bytes": 0,
        "file_count": 0,
        "top_level": [],
        "skipped_links": [],
        "skipped_special_files": [],
        "errors": [],
    }
    files: dict[str, int] = {}
    try:
        root = _plain_directory(path)
    except (OSError, ValueError) as exc:
        report["errors"].append(str(exc))
        return report, files
    groups: dict[str, dict[str, Any]] = {}
    pending = [root]
    while pending:
        directory = pending.pop()
        try:
            # Recheck queued directories in case a link appeared during scan.
            if _is_link(directory.lstat()):
                report["skipped_links"].append(
                    directory.relative_to(root).as_posix(),
                )
                continue
            with os.scandir(directory) as entries:
                for entry in entries:
                    relative = Path(entry.path).relative_to(root)
                    name = relative.as_posix()
                    try:
                        info = entry.stat(follow_symlinks=False)
                    except OSError as exc:
                        report["errors"].append(f"{name}: {exc}")
                        continue
                    if _is_link(info):
                        report["skipped_links"].append(name)
                    elif stat.S_ISDIR(info.st_mode):
                        pending.append(Path(entry.path))
                    elif stat.S_ISREG(info.st_mode):
                        report["logical_bytes"] += info.st_size
                        report["file_count"] += 1
                        group = groups.setdefault(
                            relative.parts[0],
                            {
                                "name": relative.parts[0],
                                "logical_bytes": 0,
                                "file_count": 0,
                            },
                        )
                        group["logical_bytes"] += info.st_size
                        group["file_count"] += 1
                        if collect_files:
                            files[name] = info.st_size
                    else:
                        report["skipped_special_files"].append(name)
        except OSError as exc:
            report["errors"].append(f"{directory}: {exc}")
    report["top_level"] = sorted(
        groups.values(),
        key=lambda item: (-item["logical_bytes"], item["name"]),
    )
    report["skipped_links"].sort()
    report["skipped_special_files"].sort()
    return report, files


def _record_path(value: str) -> str | None:
    value = value.replace("\\", "/")
    path = PurePosixPath(value)
    if (
        path.is_absolute()
        or PureWindowsPath(value).drive
        or ".." in path.parts
    ):
        return None
    return path.as_posix()


def measure_distributions(path: Path) -> dict[str, Any]:
    """Attribute regular in-root files without following external RECORD paths."""
    report, files = measure_directory(path, collect_files=True)
    root = Path(report["path"])
    distributions = []
    owners: dict[str, int] = {}
    metadata_directories = {
        name.split("/", 1)[0]
        for name in files
        if "/" in name and name.split("/", 1)[0].endswith(".dist-info")
    }
    for directory in sorted(metadata_directories):
        item: dict[str, Any] = {
            "name": directory,
            "version": None,
            "metadata_directory": directory,
            "logical_bytes": None,
            "file_count": None,
            "outside_site_packages": [],
            "missing_or_excluded_files": [],
            "errors": [],
        }
        metadata_name = f"{directory}/METADATA"
        record_name = f"{directory}/RECORD"
        try:
            if metadata_name in files:
                metadata = Parser().parsestr(
                    (root / metadata_name).read_text(
                        encoding="utf-8",
                        errors="replace",
                    ),
                    headersonly=True,
                )
                item["name"] = metadata.get("Name", directory)
                item["version"] = metadata.get("Version")
            if record_name not in files:
                item["errors"].append("No regular in-root RECORD file")
            else:
                owned: set[str] = set()
                with (root / record_name).open(
                    encoding="utf-8",
                    newline="",
                ) as record:
                    for row in csv.reader(record):
                        if not row or not row[0]:
                            continue
                        name = _record_path(row[0])
                        if name is None:
                            item["outside_site_packages"].append(row[0])
                        elif name not in files:
                            item["missing_or_excluded_files"].append(row[0])
                        else:
                            owned.add(name)
                item["logical_bytes"] = sum(files[name] for name in owned)
                item["file_count"] = len(owned)
                for name in owned:
                    owners[name] = owners.get(name, 0) + 1
        except (OSError, UnicodeError, csv.Error) as exc:
            item["errors"].append(str(exc))
        distributions.append(item)
    report["distributions"] = sorted(
        distributions,
        key=lambda item: (-(item["logical_bytes"] or 0), item["name"]),
    )
    report["attributed_unique_bytes"] = sum(files[name] for name in owners)
    report["unattributed_bytes"] = sum(
        size for name, size in files.items() if name not in owners
    )
    report["shared_record_file_count"] = sum(
        count > 1 for count in owners.values()
    )
    report["attribution_note"] = (
        "Only regular files inside this site-packages are attributed. RECORD "
        "entries outside it are excluded; missing RECORD means unknown size. "
        "Shared RECORD entries are counted in each distribution, so package "
        "totals need not be additive. Editable external sources are excluded."
    )
    return report


class _NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, *_args: Any, **_kwargs: Any) -> None:
        return None


def _health_endpoint(url: str) -> tuple[str, str, int]:
    parsed = urlsplit(url)
    if (
        parsed.scheme not in {"http", "https"}
        or parsed.username is not None
        or parsed.password is not None
        or parsed.fragment
    ):
        raise ValueError("Health URL must be HTTP(S) without credentials")
    host = parsed.hostname or ""
    if host == "localhost":
        host = "127.0.0.1"
    try:
        address = ipaddress.ip_address(host)
    except ValueError as exc:
        raise ValueError(
            "Health URL must use a loopback IP or localhost",
        ) from exc
    if not address.is_loopback:
        raise ValueError("Health URL must use a loopback IP or localhost")
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    authority = (
        f"[{host}]:{port}" if address.version == 6 else f"{host}:{port}"
    )
    return (
        urlunsplit(
            (parsed.scheme, authority, parsed.path or "/", parsed.query, ""),
        ),
        host,
        port,
    )


class _WindowsJob:
    """Own this invocation's descendants, including children of an exited root."""

    def __init__(self) -> None:
        from ctypes import wintypes

        class BasicLimits(ctypes.Structure):
            _fields_ = [
                ("process_time", ctypes.c_longlong),
                ("job_time", ctypes.c_longlong),
                ("flags", wintypes.DWORD),
                ("minimum_working_set", ctypes.c_size_t),
                ("maximum_working_set", ctypes.c_size_t),
                ("active_process_limit", wintypes.DWORD),
                ("affinity", ctypes.c_size_t),
                ("priority", wintypes.DWORD),
                ("scheduling", wintypes.DWORD),
            ]

        class ExtendedLimits(ctypes.Structure):
            _fields_ = [
                ("basic", BasicLimits),
                ("io_counters", ctypes.c_ulonglong * 6),
                ("process_memory", ctypes.c_size_t),
                ("job_memory", ctypes.c_size_t),
                ("peak_process_memory", ctypes.c_size_t),
                ("peak_job_memory", ctypes.c_size_t),
            ]

        self.kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        signatures = {
            "CreateJobObjectW": (
                [ctypes.c_void_p, wintypes.LPCWSTR],
                wintypes.HANDLE,
            ),
            "SetInformationJobObject": (
                [
                    wintypes.HANDLE,
                    ctypes.c_int,
                    ctypes.c_void_p,
                    wintypes.DWORD,
                ],
                wintypes.BOOL,
            ),
            "AssignProcessToJobObject": (
                [wintypes.HANDLE, wintypes.HANDLE],
                wintypes.BOOL,
            ),
            "TerminateJobObject": (
                [wintypes.HANDLE, wintypes.UINT],
                wintypes.BOOL,
            ),
            "CloseHandle": ([wintypes.HANDLE], wintypes.BOOL),
        }
        for name, (arguments, result) in signatures.items():
            function = getattr(self.kernel, name)
            function.argtypes = arguments
            function.restype = result
        self.handle = self.kernel.CreateJobObjectW(None, None)
        if not self.handle:
            raise ctypes.WinError(ctypes.get_last_error())
        limits = ExtendedLimits()
        limits.basic.flags = 0x2000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        if not self.kernel.SetInformationJobObject(
            self.handle,
            9,  # JobObjectExtendedLimitInformation
            ctypes.byref(limits),
            ctypes.sizeof(limits),
        ):
            error = ctypes.WinError(ctypes.get_last_error())
            self.close()
            raise error

    def assign_and_resume(self, process: subprocess.Popen) -> None:
        from ctypes import wintypes

        # Creation is suspended so no descendants can escape job assignment.
        handle = int(process._handle)  # pylint: disable=protected-access
        if not self.kernel.AssignProcessToJobObject(self.handle, handle):
            raise ctypes.WinError(ctypes.get_last_error())
        native = ctypes.WinDLL("ntdll")
        native.NtResumeProcess.argtypes = [wintypes.HANDLE]
        native.NtResumeProcess.restype = wintypes.LONG
        status = native.NtResumeProcess(handle)
        if status != 0:
            raise OSError(f"NtResumeProcess failed with NTSTATUS {status:#x}")

    def close(self) -> list[str]:
        errors = []
        if self.handle:
            # Closing also kills the job, even when the original parent exited.
            if not self.kernel.TerminateJobObject(self.handle, 1):
                errors.append(str(ctypes.WinError(ctypes.get_last_error())))
            if self.kernel.CloseHandle(self.handle):
                self.handle = None
            else:
                errors.append(str(ctypes.WinError(ctypes.get_last_error())))
        return errors


class _OwnedProcessTree:
    def __init__(self, command: list[str], cwd: Path | None, psutil: Any):
        self.psutil = psutil
        self.job = _WindowsJob() if os.name == "nt" else None
        self.process: subprocess.Popen | None = None
        self.known: dict[tuple[int, float], Any] = {}
        try:
            options: dict[str, Any] = {}
            if self.job:
                options["creationflags"] = (
                    0x00000004  # CREATE_SUSPENDED
                    | subprocess.CREATE_NEW_PROCESS_GROUP
                    | subprocess.CREATE_NO_WINDOW
                )
            else:
                options["start_new_session"] = True
            # The owner closes the full tree in close(), beyond this scope.
            self.process = (
                subprocess.Popen(  # pylint: disable=consider-using-with
                    command,
                    cwd=cwd,
                    stdin=subprocess.DEVNULL,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    **options,
                )
            )
            self.root = psutil.Process(self.process.pid)
            self.known[(self.root.pid, self.root.create_time())] = self.root
            if self.job:
                self.job.assign_and_resume(self.process)
        except BaseException:
            try:
                if self.process is not None:
                    self.process.kill()
                    self.process.wait(timeout=5)
            finally:
                if self.job:
                    self.job.close()
            raise

    def collect(self) -> list[dict[str, Any]]:
        """Track identities so cleanup cannot target a reused unrelated PID."""
        processes = []
        for process in list(self.known.values()):
            try:
                if process.is_running():
                    for child in process.children(recursive=True):
                        self.known[(child.pid, child.create_time())] = child
            except self.psutil.NoSuchProcess:
                continue
        for process in list(self.known.values()):
            try:
                if process.is_running():
                    processes.append(
                        {
                            "pid": process.pid,
                            "name": process.name(),
                            "rss_bytes": process.memory_info().rss,
                            "create_time": process.create_time(),
                        },
                    )
            except self.psutil.NoSuchProcess:
                continue
        return processes

    def _signal_group(self, value: int, errors: list[str]) -> None:
        if self.job is not None or self.process is None:
            return
        try:
            os.killpg(self.process.pid, value)
        except ProcessLookupError:
            pass
        except OSError as exc:
            errors.append(str(exc))

    def _signal_processes(
        self,
        processes: list[Any],
        operation: str,
        errors: list[str],
    ) -> None:
        for process in processes:
            try:
                getattr(process, operation)()
            except self.psutil.NoSuchProcess:
                pass
            except self.psutil.Error as exc:
                errors.append(str(exc))

    def close(self) -> dict[str, Any]:
        errors = []
        try:
            self.collect()
        except self.psutil.Error as exc:
            errors.append(str(exc))
        if self.job:
            errors.extend(self.job.close())
        else:
            self._signal_group(signal.SIGTERM, errors)
        owned = list(self.known.values())
        self._signal_processes(owned, "terminate", errors)
        _, alive = self.psutil.wait_procs(owned, timeout=1)
        if not self.job:
            self._signal_group(signal.SIGKILL, errors)
        self._signal_processes(alive, "kill", errors)
        _, alive = self.psutil.wait_procs(alive, timeout=3)
        if self.process is not None:
            try:
                self.process.wait(timeout=3)
            except subprocess.TimeoutExpired as exc:
                errors.append(str(exc))
        return {
            "tracked_pids": sorted(process.pid for process in owned),
            "remaining_pids": sorted(process.pid for process in alive),
            "errors": errors,
            "mechanism": "windows-job" if self.job else "posix-session",
        }


def _check_running(tree: _OwnedProcessTree) -> None:
    if tree.process is None or tree.process.poll() is not None:
        code = None if tree.process is None else tree.process.returncode
        raise RuntimeError(f"Launched command exited with code {code}")


def _wait_until_ready(
    tree: _OwnedProcessTree,
    url: str,
    started: float,
    timeout: float,
    interval: float,
) -> float:
    opener = build_opener(ProxyHandler({}), _NoRedirects())
    last_error = "No health response"
    deadline = started + timeout
    while time.monotonic() < deadline:
        _check_running(tree)
        tree.collect()
        try:
            with opener.open(
                Request(url, headers={"Connection": "close"}),
                timeout=max(0.01, min(0.5, deadline - time.monotonic())),
            ) as response:
                if 200 <= response.status < 300:
                    _check_running(tree)
                    return time.monotonic() - started
                last_error = f"HTTP {response.status}"
        except (HTTPError, URLError, OSError) as exc:
            last_error = str(exc)
        time.sleep(max(0, min(interval, deadline - time.monotonic())))
    raise TimeoutError(f"Readiness timeout after {timeout}s: {last_error}")


def _observe_wait(
    tree: _OwnedProcessTree,
    seconds: float,
    interval: float,
) -> None:
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        _check_running(tree)
        tree.collect()
        time.sleep(min(interval, max(0, deadline - time.monotonic())))
    _check_running(tree)


def measure_launch(args: argparse.Namespace) -> dict[str, Any]:
    result: dict[str, Any] = {
        "status": "failed",
        "command": args.command,
        "health_url": args.health_url,
        "cache_state_label": args.cache_state,
        "cache_note": "OS caches are not flushed or controlled by this tool.",
        "idle_wait_seconds": args.idle_seconds,
        "rss_note": (
            "Sum of process RSS/Windows working sets; shared pages may be "
            "counted multiple times. This is not private or system-wide RAM. "
            "The tool sends only health requests, then waits; application "
            "background activity is not suppressed."
        ),
        "samples": [],
    }
    tree = None
    started = time.monotonic()
    try:
        import psutil

        url, host, port = _health_endpoint(args.health_url)
        # A preexisting listener must never become this command's readiness.
        with socket.socket(
            socket.AF_INET6 if ":" in host else socket.AF_INET,
            socket.SOCK_STREAM,
        ) as probe:
            probe.settimeout(0.5)
            if probe.connect_ex((host, port)) == 0:
                raise ValueError(
                    "Health port already has a listener; use a dedicated port",
                )
        started = time.monotonic()
        tree = _OwnedProcessTree(args.command, args.working_directory, psutil)
        result["pid"] = tree.process.pid
        result["startup_seconds"] = _wait_until_ready(
            tree,
            url,
            started,
            args.startup_timeout,
            args.poll_interval,
        )
        _observe_wait(tree, args.idle_seconds, args.poll_interval)
        for index in range(args.rss_samples):
            _check_running(tree)
            processes = tree.collect()
            result["samples"].append(
                {
                    "elapsed_seconds": time.monotonic() - started,
                    "rss_bytes": sum(item["rss_bytes"] for item in processes),
                    "process_count": len(processes),
                    "processes": processes,
                },
            )
            if index + 1 < args.rss_samples:
                _observe_wait(tree, args.sample_interval, args.poll_interval)
        values = [sample["rss_bytes"] for sample in result["samples"]]
        result["rss_bytes"] = {
            "min": min(values),
            "median": statistics.median(values),
            "max": max(values),
        }
        result["status"] = "ready"
    except (Exception, KeyboardInterrupt) as exc:
        result["error"] = f"{type(exc).__name__}: {exc}"
    finally:
        result["measurement_seconds"] = time.monotonic() - started
        if tree is not None:
            result["exit_code_before_cleanup"] = tree.process.poll()
            if result["exit_code_before_cleanup"] is not None:
                result["status"] = "failed"
                result.setdefault(
                    "error",
                    "Launched command exited before measurement completed",
                )
            result["cleanup"] = tree.close()
            if (
                result["cleanup"]["remaining_pids"]
                or result["cleanup"]["errors"]
            ):
                result["status"] = "failed"
                result.setdefault("error", "Process cleanup was incomplete")
    return result


def _positive_number(value: str) -> float:
    number = float(value)
    if not math.isfinite(number) or number <= 0:
        raise argparse.ArgumentTypeError("Must be a finite positive number")
    return number


def _nonnegative_number(value: str) -> float:
    number = float(value)
    if not math.isfinite(number) or number < 0:
        raise argparse.ArgumentTypeError("Must be a finite nonnegative number")
    return number


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", action="append", type=Path, default=[])
    parser.add_argument(
        "--site-packages",
        action="append",
        type=Path,
        default=[],
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Also write the JSON report here",
    )
    parser.add_argument("--label", default="")
    parser.add_argument("--health-url")
    parser.add_argument("--working-directory", type=Path)
    parser.add_argument(
        "--startup-timeout",
        type=_positive_number,
        default=300.0,
    )
    parser.add_argument(
        "--idle-seconds",
        type=_nonnegative_number,
        default=10.0,
    )
    parser.add_argument("--poll-interval", type=_positive_number, default=0.25)
    parser.add_argument(
        "--sample-interval",
        type=_positive_number,
        default=1.0,
    )
    parser.add_argument("--rss-samples", type=int, default=5)
    parser.add_argument(
        "--cache-state",
        choices=["unspecified", "first-launch", "repeat-launch"],
        default="unspecified",
        help="Operator label only; this tool never flushes OS caches",
    )
    parser.add_argument("--command", nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    if args.command is not None and not args.command:
        parser.error("--command requires an executable and its arguments")
    if not args.root and not args.site_packages and not args.command:
        parser.error("Specify --root, --site-packages, or --command")
    if bool(args.command) != bool(args.health_url):
        parser.error("--command and --health-url must be supplied together")
    if args.rss_samples < 1:
        parser.error("--rss-samples must be at least 1")
    return args


def _platform_label() -> str:
    """Describe the OS without subprocess-based macOS platform probes."""
    native_uname = getattr(os, "uname", None)
    if native_uname is not None:
        system = native_uname()
        return f"{system.sysname}-{system.release}-{system.machine}"
    return platform.platform()


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    report: dict[str, Any] = {
        "schema_version": 1,
        "measured_at_utc": datetime.now(timezone.utc).isoformat(),
        "label": args.label,
        "platform": _platform_label(),
        "python_version": platform.python_version(),
        "size_note": (
            "Logical regular-file bytes, not allocated disk or download size. "
            "Hard-linked paths count separately. Overlapping roots are "
            "independent measurements, not additive. Links/reparse points "
            "are excluded. Files must remain unchanged during measurement."
        ),
        "directories": [measure_directory(path)[0] for path in args.root],
        "site_packages": [
            measure_distributions(path) for path in args.site_packages
        ],
        "launch": measure_launch(args) if args.command else None,
    }
    failed = any(
        item["errors"]
        for item in report["directories"] + report["site_packages"]
    ) or bool(report["launch"] and report["launch"]["status"] != "ready")
    report["status"] = "failed" if failed else "ok"
    serialized = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(serialized + "\n", encoding="utf-8")
    print(serialized)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
