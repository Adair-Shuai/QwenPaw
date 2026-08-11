# -*- coding: utf-8 -*-
"""Discovery and on-demand installation for the built-in NeqSim runtime."""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import platform
import re
import shutil
import stat
import subprocess
import tarfile
import tempfile
import threading
import time
import urllib.request
import uuid
import zipfile
from dataclasses import asdict, dataclass, field
from functools import lru_cache
from pathlib import Path, PurePosixPath
from typing import Any, Callable

from ...constant import WORKING_DIR

DEFAULT_JAVA_VERSION = "21"
DEFAULT_NEQSIM_VERSION = "3.17.0"
_ADOPTIUM_API_BASE = "https://api.adoptium.net/v3"
_NEQSIM_RELEASE_BASE = "https://github.com/equinor/neqsim/releases/download"
_HTTP_TIMEOUT_SECONDS = 180
_JAVA_VERSION_TIMEOUT_SECONDS = 10
_MAX_ARCHIVE_MEMBERS = 200_000
_MAX_EXTRACTED_BYTES = 2 * 1024 * 1024 * 1024


def runtime_root() -> Path:
    """Return the user-writable NeqSim runtime directory."""
    configured = os.environ.get("QWENPAW_NEQSIM_RUNTIME_DIR", "").strip()
    return (
        Path(configured).expanduser().resolve()
        if configured
        else Path(WORKING_DIR) / "runtimes" / "neqsim"
    )


def _java_name() -> str:
    return "java.exe" if os.name == "nt" else "java"


def _find_java(home: Path) -> Path | None:
    candidates = (
        home / "bin" / _java_name(),
        home / "Contents" / "Home" / "bin" / _java_name(),
    )
    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()
    if home.is_dir():
        for candidate in home.rglob(_java_name()):
            if candidate.parent.name == "bin" and candidate.is_file():
                return candidate.resolve()
    return None


def _find_jar(home: Path) -> Path | None:
    candidates = (
        home / "neqsim-mcp-server.jar",
        home / "neqsim" / "neqsim-mcp-server.jar",
    )
    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()
    return None


@dataclass(frozen=True)
class NeqSimRuntimeStatus:
    state: str
    ready: bool
    installable: bool
    runtime_dir: str
    java_path: str = ""
    java_source: str = ""
    jar_path: str = ""
    jar_source: str = ""
    missing: tuple[str, ...] = ()
    java_version: str = DEFAULT_JAVA_VERSION
    neqsim_version: str = DEFAULT_NEQSIM_VERSION
    runtime_source: str = ""
    java_major_version: int | None = None
    detected_neqsim_version: str = ""
    validated: bool = False
    issues: tuple[str, ...] = ()

    def to_dict(self, *, include_paths: bool = True) -> dict[str, Any]:
        data = asdict(self)
        data["missing"] = list(self.missing)
        data["issues"] = list(self.issues)
        if not include_paths:
            data.pop("java_path", None)
            data.pop("jar_path", None)
            data.pop("runtime_dir", None)
        return data


@dataclass(frozen=True)
class _RuntimeCandidate:
    source: str
    java_path: Path | None
    jar_path: Path | None


def _file_cache_key(path: Path) -> tuple[str, int, int]:
    resolved = path.resolve()
    info = resolved.stat()
    return str(resolved), info.st_mtime_ns, info.st_size


@lru_cache(maxsize=32)
def _probe_java_major_cached(
    path: str,
    _mtime_ns: int,
    _size: int,
) -> int | None:
    try:
        completed = subprocess.run(
            [path, "-version"],
            capture_output=True,
            check=False,
            creationflags=(
                getattr(subprocess, "CREATE_NO_WINDOW", 0)
                if os.name == "nt"
                else 0
            ),
            text=True,
            timeout=_JAVA_VERSION_TIMEOUT_SECONDS,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    output = f"{completed.stderr}\n{completed.stdout}"
    match = re.search(r'version\s+["\'](?P<version>[^"\']+)', output, re.I)
    if match is None:
        match = re.search(
            r"(?:openjdk|java)\s+(?P<version>\d+(?:\.\d+)*)",
            output,
            re.I,
        )
    if match is None:
        return None
    raw = match.group("version")
    parts = raw.split(".")
    try:
        return int(
            parts[1] if parts[0] == "1" and len(parts) > 1 else parts[0],
        )
    except ValueError:
        return None


def _java_major_version(path: Path) -> int | None:
    try:
        return _probe_java_major_cached(*_file_cache_key(path))
    except OSError:
        return None


def _normalize_version(value: str) -> str:
    match = re.search(r"(?<!\d)(\d+\.\d+\.\d+)(?!\d)", value)
    return match.group(1) if match else ""


@lru_cache(maxsize=32)
def _probe_jar_version_cached(path: str, _mtime_ns: int, _size: int) -> str:
    jar = Path(path)
    for marker in (
        jar.parent / ".neqsim-version",
        jar.parent.parent / ".neqsim-version",
    ):
        try:
            version = _normalize_version(
                marker.read_text(encoding="utf-8").strip(),
            )
        except OSError:
            continue
        if version:
            return version

    filename_version = _normalize_version(jar.name)
    if filename_version:
        return filename_version

    try:
        with zipfile.ZipFile(jar) as bundle:
            manifest = bundle.read("META-INF/MANIFEST.MF").decode(
                "utf-8",
                errors="replace",
            )
    except (OSError, KeyError, zipfile.BadZipFile):
        return ""
    for key in (
        "Implementation-Version",
        "Specification-Version",
        "Quarkus-Application-Version",
    ):
        match = re.search(
            rf"^{re.escape(key)}:\s*(.+)$",
            manifest,
            re.M | re.I,
        )
        if match:
            version = _normalize_version(match.group(1))
            if version:
                return version
    return ""


def _neqsim_jar_version(path: Path) -> str:
    try:
        return _probe_jar_version_cached(*_file_cache_key(path))
    except OSError:
        return ""


def _desktop_candidate() -> _RuntimeCandidate:
    java_path: Path | None = None
    jar_path: Path | None = None
    desktop_java = os.environ.get("QWENPAW_DESKTOP_JAVA_HOME", "").strip()
    if desktop_java:
        java_path = _find_java(Path(desktop_java))
    desktop_jar = os.environ.get("QWENPAW_DESKTOP_NEQSIM_JAR", "").strip()
    if desktop_jar and Path(desktop_jar).is_file():
        jar_path = Path(desktop_jar).resolve()

    resource_dir = os.environ.get("QWENPAW_TAURI_RESOURCE_DIR", "").strip()
    if resource_dir:
        resources = Path(resource_dir) / "binaries"
        java_path = java_path or _find_java(resources / "java-runtime")
        jar_path = jar_path or _find_jar(resources)
    return _RuntimeCandidate("desktop", java_path, jar_path)


def _user_candidate(root: Path) -> _RuntimeCandidate:
    return _RuntimeCandidate(
        "user",
        _find_java(root / "java"),
        _find_jar(root),
    )


def _external_candidate() -> _RuntimeCandidate:
    java_path: Path | None = None
    java_home = os.environ.get("JAVA_HOME", "").strip()
    if java_home:
        java_path = _find_java(Path(java_home))
    if java_path is None:
        resolved = shutil.which("java")
        java_path = Path(resolved).resolve() if resolved else None

    jar_path: Path | None = None
    external_jar = os.environ.get("NEQSIM_JAR", "").strip()
    if external_jar and Path(external_jar).is_file():
        jar_path = Path(external_jar).resolve()
    if jar_path is None:
        neqsim_home = os.environ.get("NEQSIM_HOME", "").strip()
        if neqsim_home:
            jar_path = _find_jar(Path(neqsim_home))
    return _RuntimeCandidate("external", java_path, jar_path)


def discover_runtime(root: Path | None = None) -> NeqSimRuntimeStatus:
    """Discover one complete, compatible NeqSim runtime pair.

    An explicitly supplied ``root`` is intentionally isolated from desktop and
    external candidates. This is used to validate installer staging without a
    valid system runtime accidentally masking an incomplete download.
    """
    user_root = (root or runtime_root()).expanduser().resolve()
    candidates = (
        [_user_candidate(user_root)]
        if root is not None
        else [
            _desktop_candidate(),
            _user_candidate(user_root),
            _external_candidate(),
        ]
    )
    required_java_major = int(DEFAULT_JAVA_VERSION)
    evaluated: list[
        tuple[_RuntimeCandidate, int | None, str, tuple[str, ...]]
    ] = []

    for candidate in candidates:
        issues: list[str] = []
        java_major = (
            _java_major_version(candidate.java_path)
            if candidate.java_path is not None
            else None
        )
        jar_version = (
            _neqsim_jar_version(candidate.jar_path)
            if candidate.jar_path is not None
            else ""
        )
        if candidate.java_path is not None:
            if java_major is None:
                issues.append(
                    f"Cannot determine Java version for {candidate.java_path}",
                )
            elif java_major < required_java_major:
                issues.append(
                    f"Java {java_major} is unsupported; Java "
                    f"{required_java_major} or newer is required",
                )
        if candidate.jar_path is not None:
            if not jar_version:
                issues.append(
                    "Cannot determine NeqSim MCP Server version; add a "
                    ".neqsim-version marker or use the built-in installer",
                )
            elif jar_version != DEFAULT_NEQSIM_VERSION:
                issues.append(
                    f"NeqSim MCP Server {jar_version} is unsupported; "
                    f"version {DEFAULT_NEQSIM_VERSION} is required",
                )
        evaluated.append((candidate, java_major, jar_version, tuple(issues)))
        if candidate.java_path and candidate.jar_path and not issues:
            return NeqSimRuntimeStatus(
                state="ready",
                ready=True,
                installable=True,
                runtime_dir=str(user_root),
                java_path=str(candidate.java_path),
                java_source=candidate.source,
                jar_path=str(candidate.jar_path),
                jar_source=candidate.source,
                runtime_source=candidate.source,
                java_major_version=java_major,
                detected_neqsim_version=jar_version,
                validated=True,
            )

    candidate, java_major, jar_version, candidate_issues = max(
        evaluated,
        key=lambda item: int(item[0].java_path is not None)
        + int(item[0].jar_path is not None),
    )
    missing: list[str] = []
    if candidate.java_path is None:
        missing.append("java-runtime")
    if candidate.jar_path is None:
        missing.append("neqsim-mcp-server")
    issues = list(candidate_issues)
    java_sources = {
        item.source for item, *_rest in evaluated if item.java_path
    }
    jar_sources = {item.source for item, *_rest in evaluated if item.jar_path}
    if (
        (candidate.java_path is None or candidate.jar_path is None)
        and java_sources
        and jar_sources
        and java_sources.isdisjoint(jar_sources)
    ):
        issues.append(
            "Java and NeqSim MCP Server were found in different runtime "
            + "sources; cross-source combinations are not activated",
        )
    state = (
        "incompatible"
        if not missing and issues
        else ("partial" if len(missing) == 1 else "needs_install")
    )
    return NeqSimRuntimeStatus(
        state=state,
        ready=False,
        installable=True,
        runtime_dir=str(user_root),
        java_path=str(candidate.java_path or ""),
        java_source=candidate.source if candidate.java_path else "",
        jar_path=str(candidate.jar_path or ""),
        jar_source=candidate.source if candidate.jar_path else "",
        missing=tuple(missing),
        runtime_source=(
            candidate.source
            if candidate.java_path or candidate.jar_path
            else ""
        ),
        java_major_version=java_major,
        detected_neqsim_version=jar_version,
        validated=False,
        issues=tuple(issues),
    )


def build_endpoint(
    status: NeqSimRuntimeStatus | None = None,
) -> dict[str, Any]:
    """Build the stable stdio endpoint.

    Expected pre-install paths are included.
    """
    current = status or discover_runtime()
    root = Path(current.runtime_dir)
    command = current.java_path or str(root / "java" / "bin" / _java_name())
    jar = current.jar_path or str(root / "neqsim-mcp-server.jar")
    return {
        "transport": "stdio",
        "command": command,
        "args": [
            "-Dquarkus.profile=stdio",
            "-Dquarkus.log.level=WARN",
            "-jar",
            jar,
        ],
        "env": {},
    }


def _target() -> tuple[str, str]:
    system = platform.system()
    machine = platform.machine().lower()
    arch = {
        "amd64": "x64",
        "x86_64": "x64",
        "arm64": "aarch64",
        "aarch64": "aarch64",
    }.get(machine)
    os_name = {"Windows": "windows", "Darwin": "mac", "Linux": "linux"}.get(
        system,
    )
    if arch is None or os_name is None:
        raise RuntimeError(
            f"Unsupported NeqSim runtime platform: {system}/{machine}",
        )
    return os_name, arch


def _request(url: str) -> urllib.request.Request:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "qwenpaw-neqsim-installer"},
    )
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    return request


def _read_bytes(url: str) -> bytes:
    with urllib.request.urlopen(
        _request(url),
        timeout=_HTTP_TIMEOUT_SECONDS,
    ) as response:
        return response.read()


def _download(url: str, target: Path, expected_sha256: str) -> None:
    hasher = hashlib.sha256()
    with urllib.request.urlopen(
        _request(url),
        timeout=_HTTP_TIMEOUT_SECONDS,
    ) as response:
        with target.open("wb") as stream:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                stream.write(chunk)
                hasher.update(chunk)
    actual = hasher.hexdigest().lower()
    if not expected_sha256 or actual != expected_sha256.lower():
        target.unlink(missing_ok=True)
        raise RuntimeError(
            f"SHA-256 verification failed for {target.name}: "
            f"expected {expected_sha256}, got {actual}",
        )


def _java_asset(java_version: str) -> tuple[str, str, str]:
    os_name, arch = _target()
    url = (
        f"{_ADOPTIUM_API_BASE}/assets/feature_releases/{java_version}/ga"
        f"?architecture={arch}&heap_size=normal&image_type=jre"
        f"&os={os_name}&project=jdk&vendor=eclipse"
    )
    releases = json.loads(_read_bytes(url).decode("utf-8"))
    if not releases:
        raise RuntimeError("No Eclipse Temurin JRE release found")
    package = releases[0]["binaries"][0]["package"]
    return str(package["link"]), str(package["checksum"]), str(package["name"])


def _neqsim_asset(version: str) -> tuple[str, str]:
    tag = version if version.startswith("v") else f"v{version}"
    plain = version.lstrip("v")
    name = f"neqsim-mcp-server-{plain}-runner.jar"
    base = f"{_NEQSIM_RELEASE_BASE}/{tag}/{name}"
    checksum = _read_bytes(f"{base}.sha256").decode("utf-8").strip().split()[0]
    return base, checksum


def _safe_archive_target(root: Path, name: str) -> Path:
    if not name or "\x00" in name:
        raise RuntimeError("Unsafe empty or NUL path in JRE archive")
    normalized = PurePosixPath(name.replace("\\", "/"))
    if normalized.is_absolute() or ".." in normalized.parts:
        raise RuntimeError(f"Unsafe path in JRE archive: {name}")
    target = root.joinpath(*normalized.parts).resolve()
    if not target.is_relative_to(root.resolve()):
        raise RuntimeError(f"Unsafe path in JRE archive: {name}")
    return target


def _validate_archive_budget(member_count: int, total_size: int) -> None:
    if member_count > _MAX_ARCHIVE_MEMBERS:
        raise RuntimeError("JRE archive contains too many entries")
    if total_size > _MAX_EXTRACTED_BYTES:
        raise RuntimeError("JRE archive expands beyond the safety limit")


def _apply_safe_mode(path: Path, mode: int) -> None:
    if os.name != "nt":
        path.chmod(mode & 0o777)


def _extract_zip_safely(archive: Path, extraction: Path) -> None:
    with zipfile.ZipFile(archive) as bundle:
        members = bundle.infolist()
        if any(item.file_size < 0 for item in members):
            raise RuntimeError("JRE archive contains an invalid file size")
        _validate_archive_budget(
            len(members),
            sum(item.file_size for item in members),
        )
        seen: set[Path] = set()
        for item in members:
            target = _safe_archive_target(extraction, item.filename)
            if target in seen:
                raise RuntimeError(
                    f"Duplicate path in JRE archive: {item.filename}",
                )
            seen.add(target)
            unix_mode = (item.external_attr >> 16) & 0xFFFF
            file_type = stat.S_IFMT(unix_mode)
            is_directory = item.is_dir() or file_type == stat.S_IFDIR
            if file_type not in (0, stat.S_IFREG, stat.S_IFDIR):
                raise RuntimeError(
                    f"Links and special files are not allowed in JRE archive: "
                    f"{item.filename}",
                )
            if is_directory:
                target.mkdir(parents=True, exist_ok=True)
                _apply_safe_mode(target, unix_mode or 0o755)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with bundle.open(item, "r") as source, target.open("xb") as output:
                shutil.copyfileobj(source, output)
            _apply_safe_mode(target, unix_mode or 0o644)


def _extract_tar_safely(archive: Path, extraction: Path) -> None:
    with tarfile.open(archive, "r:*") as bundle:
        members = bundle.getmembers()
        if any(item.size < 0 for item in members):
            raise RuntimeError("JRE archive contains an invalid file size")
        _validate_archive_budget(
            len(members),
            sum(item.size for item in members),
        )
        seen: set[Path] = set()
        for item in members:
            target = _safe_archive_target(extraction, item.name)
            if target in seen:
                raise RuntimeError(
                    f"Duplicate path in JRE archive: {item.name}",
                )
            seen.add(target)
            if not (item.isdir() or item.isreg()):
                raise RuntimeError(
                    f"Links and special files are not allowed in JRE archive: "
                    f"{item.name}",
                )
            if item.isdir():
                target.mkdir(parents=True, exist_ok=True)
                _apply_safe_mode(target, item.mode or 0o755)
                continue
            source = bundle.extractfile(item)
            if source is None:
                raise RuntimeError(
                    f"Cannot read JRE archive member: {item.name}",
                )
            target.parent.mkdir(parents=True, exist_ok=True)
            with source, target.open("xb") as output:
                shutil.copyfileobj(source, output)
            _apply_safe_mode(target, item.mode or 0o644)


def _extract_archive(archive: Path, destination: Path) -> Path:
    if destination.is_symlink():
        raise RuntimeError("JRE extraction destination must not be a symlink")
    extraction = destination / "extracted"
    if extraction.is_symlink():
        raise RuntimeError("JRE extraction directory must not be a symlink")
    extraction.mkdir(parents=True, exist_ok=True)
    if archive.suffix.lower() == ".zip":
        _extract_zip_safely(archive, extraction)
    else:
        _extract_tar_safely(archive, extraction)
    java = _find_java(extraction)
    if java is None:
        raise RuntimeError("Downloaded JRE does not contain a java executable")
    return java.parent.parent


def _replace_tree(source: Path, target: Path) -> None:
    backup = target.with_name(f".{target.name}.backup-{uuid.uuid4().hex}")
    if target.exists():
        os.replace(target, backup)
    try:
        os.replace(source, target)
    except BaseException:
        if backup.exists() and not target.exists():
            os.replace(backup, target)
        raise
    if backup.exists():
        shutil.rmtree(backup, ignore_errors=True)


def install_runtime(
    *,
    java_version: str = DEFAULT_JAVA_VERSION,
    neqsim_version: str = DEFAULT_NEQSIM_VERSION,
    progress: Callable[[str, int], None] | None = None,
) -> NeqSimRuntimeStatus:
    """Download, verify, and atomically install the user NeqSim runtime."""
    report = progress or (lambda _message, _percent: None)
    root = runtime_root()
    root.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(
        prefix=".neqsim-install-",
        dir=root.parent,
    ) as temp:
        staging = Path(temp) / "runtime"
        staging.mkdir(parents=True)

        report("正在获取 Java 运行时信息", 5)
        java_url, java_sha, java_name = _java_asset(java_version)
        java_archive = Path(temp) / java_name
        report("正在下载并校验 Java 运行时", 15)
        _download(java_url, java_archive, java_sha)
        java_root = _extract_archive(java_archive, Path(temp) / "java-work")
        shutil.copytree(java_root, staging / "java")
        (staging / ".java-runtime-version").write_text(
            java_version,
            encoding="utf-8",
        )

        report("正在下载并校验 NeqSim MCP Server", 65)
        jar_url, jar_sha = _neqsim_asset(neqsim_version)
        _download(jar_url, staging / "neqsim-mcp-server.jar", jar_sha)
        (staging / ".neqsim-version").write_text(
            neqsim_version,
            encoding="utf-8",
        )

        staged = discover_runtime(staging)
        if not staged.ready:
            missing_text = ", ".join(staged.missing)
            raise RuntimeError(
                f"Installed runtime is incomplete: {missing_text}",
            )
        report("正在启用 NeqSim 内置 Driver", 90)
        _replace_tree(staging, root)

    report("NeqSim 运行环境安装完成", 100)
    return discover_runtime()


@dataclass
class InstallTask:
    id: str
    status: str = "queued"
    progress: int = 0
    message: str = "等待安装"
    error: str = ""
    warning: str = ""
    created_at: float = field(default_factory=time.time)
    finished_at: float | None = None
    runtime: dict[str, Any] | None = None
    recovered: bool = False

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class NeqSimInstallManager:
    """Durable installer task registry used by the UGSci API."""

    def __init__(
        self,
        state_path: Path | None = None,
        *,
        max_tasks: int = 20,
    ) -> None:
        self._tasks: dict[str, InstallTask] = {}
        self._active_task_id: str | None = None
        self._interrupted_task_ids: set[str] = set()
        self._lock = threading.Lock()
        self._state_path = state_path or (
            runtime_root().parent / "neqsim-install-tasks.json"
        )
        self._max_tasks = max(1, max_tasks)
        self._load_state()

    def _load_state(self) -> None:
        try:
            payload = json.loads(self._state_path.read_text(encoding="utf-8"))
        except (FileNotFoundError, OSError, ValueError, TypeError):
            return

        raw_tasks = (
            payload.get("tasks", []) if isinstance(payload, dict) else []
        )
        if not isinstance(raw_tasks, list):
            return
        for raw in raw_tasks:
            if not isinstance(raw, dict) or not raw.get("id"):
                continue
            try:
                task = InstallTask(
                    id=str(raw["id"]),
                    status=str(raw.get("status", "failed")),
                    progress=max(0, min(100, int(raw.get("progress", 0)))),
                    message=str(raw.get("message", "")),
                    error=str(raw.get("error", "")),
                    warning=str(raw.get("warning", "")),
                    created_at=float(raw.get("created_at", time.time())),
                    finished_at=(
                        float(raw["finished_at"])
                        if raw.get("finished_at") is not None
                        else None
                    ),
                    runtime=(
                        raw.get("runtime")
                        if isinstance(raw.get("runtime"), dict)
                        else None
                    ),
                    recovered=bool(raw.get("recovered", False)),
                )
            except (TypeError, ValueError, OverflowError):
                continue
            self._tasks[task.id] = task
            if task.status in {"queued", "running"}:
                self._interrupted_task_ids.add(task.id)
        self._prune_locked()

    def _prune_locked(self) -> None:
        if len(self._tasks) <= self._max_tasks:
            return
        keep = sorted(
            self._tasks.values(),
            key=lambda item: item.created_at,
            reverse=True,
        )[: self._max_tasks]
        keep_ids = {task.id for task in keep}
        self._tasks = {task.id: task for task in keep}
        self._interrupted_task_ids.intersection_update(keep_ids)

    def _persist_locked(self) -> None:
        self._prune_locked()
        self._state_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema_version": 1,
            "tasks": [
                task.to_dict()
                for task in sorted(
                    self._tasks.values(),
                    key=lambda item: item.created_at,
                )
            ],
        }
        temp_path = self._state_path.with_name(
            f".{self._state_path.name}.{uuid.uuid4().hex}.tmp",
        )
        try:
            with temp_path.open("w", encoding="utf-8") as handle:
                json.dump(payload, handle, ensure_ascii=False, indent=2)
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temp_path, self._state_path)
        finally:
            temp_path.unlink(missing_ok=True)

    def _recover_interrupted(self, task_id: str) -> InstallTask | None:
        with self._lock:
            task = self._tasks.get(task_id)
            if task is None or task_id not in self._interrupted_task_ids:
                return task

        try:
            runtime_status = discover_runtime()
            recovery_error = ""
        except Exception as exc:  # pragma: no cover - defensive probe failure
            runtime_status = None
            recovery_error = str(exc)

        with self._lock:
            task = self._tasks.get(task_id)
            if task is None or task_id not in self._interrupted_task_ids:
                return task
            task.recovered = True
            task.finished_at = time.time()
            if runtime_status is not None and runtime_status.ready:
                task.status = "completed"
                task.progress = 100
                task.message = "NeqSim 运行环境已恢复并可用"
                task.error = ""
                task.runtime = runtime_status.to_dict()
            else:
                task.status = "failed"
                task.message = "安装进程因后端重启中断"
                task.error = recovery_error or (
                    "后端重启后未发现完整的 NeqSim 运行环境，请重新安装"
                )
                if runtime_status is not None:
                    task.runtime = runtime_status.to_dict()
            self._interrupted_task_ids.discard(task_id)
            self._persist_locked()
            return task

    def get(self, task_id: str) -> InstallTask | None:
        return self._recover_interrupted(task_id)

    def start(
        self,
        on_installed: Callable[[], Any] | None = None,
    ) -> InstallTask:
        for interrupted_id in tuple(self._interrupted_task_ids):
            self._recover_interrupted(interrupted_id)
        with self._lock:
            if self._active_task_id:
                active = self._tasks.get(self._active_task_id)
                if active and active.status in {"queued", "running"}:
                    return active
            task = InstallTask(id=uuid.uuid4().hex)
            self._tasks[task.id] = task
            self._active_task_id = task.id
            self._persist_locked()
        asyncio.create_task(self._run(task, on_installed))
        return task

    async def _run(
        self,
        task: InstallTask,
        on_installed: Callable[[], Any] | None,
    ) -> None:
        def update(message: str, percent: int) -> None:
            with self._lock:
                task.status = "running"
                task.message = message
                task.progress = percent
                self._persist_locked()

        try:
            status = await asyncio.to_thread(install_runtime, progress=update)
            callback_warning = ""
            if on_installed is not None:
                try:
                    callback_result = on_installed()
                    if asyncio.iscoroutine(callback_result):
                        await callback_result
                except Exception as exc:  # runtime is already installed
                    callback_warning = (
                        "NeqSim 运行环境已安装，但 Driver 即时刷新失败；" + f"重启后端后会自动恢复：{exc}"
                    )
            with self._lock:
                task.status = "completed"
                task.progress = 100
                task.message = (
                    "NeqSim 运行环境安装完成，Driver 将在后端重启后恢复"
                    if callback_warning
                    else "NeqSim 运行环境安装完成"
                )
                task.warning = callback_warning
                task.runtime = status.to_dict()
                task.finished_at = time.time()
                self._persist_locked()
        except (
            Exception
        ) as exc:  # pragma: no cover - network/platform failures
            with self._lock:
                task.status = "failed"
                task.error = str(exc)
                task.message = "NeqSim 运行环境安装失败"
                task.finished_at = time.time()
                self._persist_locked()
        finally:
            with self._lock:
                if self._active_task_id == task.id:
                    self._active_task_id = None
                    self._persist_locked()


install_manager = NeqSimInstallManager()


__all__ = [
    "DEFAULT_JAVA_VERSION",
    "DEFAULT_NEQSIM_VERSION",
    "InstallTask",
    "NeqSimInstallManager",
    "NeqSimRuntimeStatus",
    "build_endpoint",
    "discover_runtime",
    "install_manager",
    "install_runtime",
    "runtime_root",
]
