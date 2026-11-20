# -*- coding: utf-8 -*-
"""Durable install jobs. Registration is the final visible commit."""

import asyncio
import hashlib
import inspect
import json
import os
from pathlib import Path
import shutil
import sys
from typing import Any
import uuid

from filelock import FileLock, Timeout

from ..components.update import _is_link_like
from ..drivers.errors import DriverCardError
from ..utils.io_utils import write_json_atomic, run_sync_io
from . import binding, runtime
from .source import Channel, extract, verify_tree
from .readiness import ReadinessError
from .environments import active_environment, identity_file

ACTIVE = {
    "queued",
    "downloading",
    "preparing",
    "verifying",
    "activating",
    "starting",
}
ACTIVE.update({"repairing", "repair_verifying", "repair_committing"})


class ExpertInstallService:
    def __init__(
        self,
        root: Path,
        channel: Channel,
        core_version: str,
        on_ready=None,
        on_repair=None,
    ):
        self.root = root
        self.channel = channel
        self.core_version = core_version
        self.on_ready = on_ready
        self.on_repair = on_repair
        self.tasks: dict[str, asyncio.Task] = {}
        # A historical receipt cannot prove that a new host process has loaded
        # this expert. Recheck startup after restart instead of showing green.
        self.started: set[str] = set()
        self.closing = False
        root.mkdir(parents=True, exist_ok=True)

    def path(self, job_id: str):
        if len(job_id) != 64 or any(
            c not in "0123456789abcdef" for c in job_id
        ):
            raise ValueError("Invalid installation ID")
        # Keep filesystem paths short on Windows; full identity is retained and
        # checked in metadata, so a prefix collision cannot overwrite a plan.
        return self.root / "jobs" / job_id[:24]

    @staticmethod
    def environment_identity(artifact_hash: str):
        return hashlib.sha256(
            (runtime.host_python() + sys.version + artifact_hash).encode(),
        ).hexdigest()

    def environment_current(self, folder: Path):
        try:
            plan = json.loads(
                (folder / "plan.json").read_text(encoding="utf-8"),
            )
            artifact = json.loads(plan["raw"])["artifact"]["sha256"]
            environment = active_environment(folder)
            saved = json.loads(
                identity_file(folder, environment).read_text(encoding="utf-8"),
            )
            identity = (
                saved.get("identity") if isinstance(saved, dict) else saved
            )
            return runtime.python_path(
                environment,
            ).is_file() and identity == self.environment_identity(artifact)
        except (OSError, ValueError, KeyError, DriverCardError):
            return False

    async def plan(self, path: str):
        release, raw, signature = await run_sync_io(
            self.channel.release,
            path,
            self.core_version,
        )
        job_id = hashlib.sha256(raw).hexdigest()
        folder = self.path(job_id)
        folder.mkdir(parents=True, exist_ok=True)
        existing = folder / "plan.json"
        if (
            existing.exists()
            and json.loads(existing.read_text(encoding="utf-8")).get("id")
            != job_id
        ):
            raise ValueError("Installation directory identity collision")
        # Content-addressed metadata is immutable and is reverified on use.
        write_json_atomic(
            folder / "plan.json",
            {
                "id": job_id,
                "raw": raw.decode(),
                "signature": signature,
                "channel": self.channel.base,
            },
        )
        return {
            "id": job_id,
            "name": release.name,
            "version": release.version,
            "download_bytes": release.artifact.size,
            "skills": len(release.skills),
            "tools": release.mcp.tools,
            "optional_setup": release.optional_setup,
            "status": self.status(job_id)["status"],
        }

    def status(self, job_id: str):
        folder = self.path(job_id)
        if not (folder / "plan.json").is_file():
            raise FileNotFoundError("Installation not found")
        if (
            json.loads((folder / "plan.json").read_text(encoding="utf-8"))[
                "id"
            ]
            != job_id
        ):
            raise ValueError("Installation identity mismatch")
        state_file = folder / "state.json"
        state = (
            json.loads(state_file.read_text(encoding="utf-8"))
            if state_file.exists()
            else {"id": job_id, "status": "planned"}
        )
        if state["status"] in {"ready", "startup_failed", "repaired"}:
            from ..config.utils import load_config

            profile = load_config().agents.profiles.get(state.get("agent_id"))
            if job_id not in self.started or (profile and not profile.enabled):
                state = {**state, "runtime_verified": False}
            if profile is None:
                state = {
                    **state,
                    "status": "removed",
                    "error": "专家已删除，可重新安装；保留原工作区内容",
                    "problem": None,
                }
            elif not self.environment_current(folder):
                state = {
                    **state,
                    "status": "repair_required",
                    "error": "运行环境缺失或宿主 Python 已变化，可修复环境；专家实例和原工作区会保留",
                    "runtime_verified": False,
                    "problem": {
                        "code": "environment_repair",
                        "action": "experts",
                        "items": [],
                    },
                }
        if (
            job_id in self.tasks
            and not self.tasks[job_id].done()
            and state["status"]
            in {
                "planned",
                "failed",
                "cancelled",
                "interrupted",
                "startup_failed",
            }
        ):
            state = {**state, "status": "queued", "error": None}
        if state["status"] in ACTIVE and job_id not in self.tasks:
            lock = FileLock(str(folder / "install.lock"), thread_local=False)
            try:
                with lock.acquire(timeout=0):
                    state = {
                        **state,
                        "status": "interrupted",
                        "error": (
                            "修复已中断，可继续修复"
                            if state.get("operation") == "repair"
                            else "安装已中断，可继续安装"
                        ),
                    }
            except Timeout:
                pass
        return state

    def list_jobs(self):
        jobs = []
        for path in (self.root / "jobs").glob("*/plan.json"):
            try:
                jobs.append(
                    self.status(
                        json.loads(path.read_text(encoding="utf-8"))["id"],
                    ),
                )
            except (ValueError, KeyError, OSError):
                # One corrupt record must not hide all other installations.
                continue
        return jobs

    async def start(self, job_id: str):
        if self.closing:
            raise ValueError("服务正在停止，请稍后重试")
        state = self.status(job_id)
        if state.get("operation") == "repair" and state["status"] in {
            "interrupted",
            "cancelled",
            "repair_failed",
        }:
            return await self.repair(job_id)
        if state["status"] == "repair_required":
            raise ValueError(state["error"])
        if job_id in self.tasks or (
            state["status"] == "ready"
            and (state.get("runtime_verified") or self.on_ready is None)
        ):
            return state
        (self.path(job_id) / "cancel.json").unlink(missing_ok=True)
        task = asyncio.create_task(self._run(job_id))
        self.tasks[job_id] = task
        task.add_done_callback(lambda _: self.tasks.pop(job_id, None))
        await asyncio.sleep(0)
        return self.status(job_id)

    async def repair(self, job_id: str):
        from .repair import repair_environment

        if self.closing:
            raise ValueError("服务正在停止，请稍后重试")
        state = self.status(job_id)
        if job_id in self.tasks:
            return state
        if self.on_repair is None:
            raise ValueError("当前宿主无法安全维护专家，请更新宿主")
        if not state.get("agent_id"):
            raise ValueError("请先完成专家安装")
        # Fail before preparing anything when the expert is still active.
        async with self.on_repair(state["agent_id"]):
            pass
        (self.path(job_id) / "cancel.json").unlink(missing_ok=True)
        task = asyncio.create_task(repair_environment(self, job_id))
        self.tasks[job_id] = task
        task.add_done_callback(lambda _: self.tasks.pop(job_id, None))
        await asyncio.sleep(0)
        return self.status(job_id)

    async def close(self):
        self.closing = True
        self.on_ready = None
        tasks = list(self.tasks.values())
        for job_id in self.tasks:
            write_json_atomic(self.path(job_id) / "cancel.json", True)
        await asyncio.gather(*tasks, return_exceptions=True)

    def cancel(self, job_id: str):
        state = self.status(job_id)
        if state["status"] == "repair_committing":
            raise ValueError("正在切换已验证的运行环境，请等待完成")
        if state["status"] in {"activating", "starting"}:
            raise ValueError("专家正在登记，请等待完成")
        if state["status"] != "ready":
            write_json_atomic(self.path(job_id) / "cancel.json", True)
        return state

    def _remove_incomplete(
        self,
        target: Path,
        *,
        python_environment: bool = False,
    ):
        # This only touches installer-owned environments and staging.
        if (
            self.root.resolve() not in target.resolve().parents
            or _is_link_like(target)
        ):
            raise ValueError("Unsafe installation directory")
        if not target.exists():
            return
        # On 64-bit Linux, venv creates a relative lib64 -> lib alias.
        # rmtree unlinks it without traversing its target.
        lib64 = (
            target / "lib64"
            if python_environment and os.name != "nt"
            else None
        )
        for path in target.rglob("*"):
            if not _is_link_like(path) or not path.is_dir():
                continue
            if (
                path == lib64
                and path.is_symlink()
                and path.readlink() == Path("lib")
                and not _is_link_like(target / "lib")
            ):
                continue
            raise ValueError("Linked installation directory")
        shutil.rmtree(target)

    # The job lock spans preparation, activation and cancellation cleanup.
    # pylint: disable-next=too-many-branches,too-many-statements
    async def _run(self, job_id: str):
        folder = self.path(job_id)
        lock = FileLock(str(folder / "install.lock"), thread_local=False)
        try:
            await run_sync_io(lock.acquire, timeout=0)
        except Timeout:
            return
        except asyncio.CancelledError:
            if lock.is_locked:
                lock.release()
            raise
        state: dict[str, Any] = {"id": job_id}

        def update(status, **extra):
            state.update(status=status, **extra)
            write_json_atomic(folder / "state.json", state)

        def cancelled():
            if (folder / "cancel.json").exists():
                raise InterruptedError("安装已取消，可继续安装")

        async def activate(agent_id, receipt):
            if self.on_ready is None:
                update(
                    "ready",
                    agent_id=agent_id,
                    verification=receipt,
                    runtime_verified=False,
                    error=None,
                    problem=None,
                )
                return
            update(
                "starting",
                agent_id=agent_id,
                verification=receipt,
                runtime_verified=False,
                error=None,
                problem=None,
            )
            try:
                result = self.on_ready(agent_id)
                if inspect.isawaitable(result):
                    async with asyncio.timeout(180):
                        result = await result
                if result is not True:
                    raise ValueError(
                        "专家启动未成功，请查看专家配置后重试启动",
                    )
            except Exception as exc:
                # The install is committed. Retry only startup, preserving all
                # user files and the offline environment, even after restart.
                update(
                    "startup_failed",
                    error=str(exc)[:3500] or "专家启动失败",
                    problem=(
                        exc.problem
                        if isinstance(exc, ReadinessError)
                        else {
                            "code": "startup_failed",
                            "action": "experts",
                            "items": [],
                        }
                    ),
                )
                return
            update("ready", runtime_verified=True, error=None, problem=None)
            self.started.add(job_id)

        try:
            plan = json.loads(
                (folder / "plan.json").read_text(encoding="utf-8"),
            )
            if plan["channel"] != self.channel.base:
                raise ValueError("专家渠道已改变，请重新获取安装计划")
            raw = plan["raw"].encode()
            if hashlib.sha256(raw).hexdigest() != job_id:
                raise ValueError("Installation plan changed")
            release = self.channel.validate(
                raw,
                plan["signature"],
                self.core_version,
            )
            state.update(
                name=release.name,
                version=release.version,
                optional_setup=release.optional_setup,
            )
            agent_id = "ep-" + job_id[:20]
            workspace = folder / "workspace"
            installed = await run_sync_io(
                binding.installed_receipt,
                workspace,
                release,
                agent_id,
            )
            if installed is not None:
                if not self.environment_current(folder):
                    raise ValueError(
                        "已有专家运行环境需修复，请使用修复运行环境；原工作区会保留",
                    )
                await activate(agent_id, installed)
                return
            update("downloading")
            package = folder / "package"
            if package.exists():
                await run_sync_io(verify_tree, package, release)
            else:
                archive = folder / "package.zip"
                if not archive.exists():
                    content = await run_sync_io(
                        self.channel.read,
                        release.artifact.path,
                        release.artifact.size,
                    )
                    temporary = folder / f"{uuid.uuid4().hex}.part"
                    temporary.write_bytes(content)
                    os.replace(temporary, archive)
                stage = folder / ("stage-" + uuid.uuid4().hex)
                try:
                    await run_sync_io(extract, archive, stage, release)
                    os.replace(stage, package)
                except Exception:
                    archive.unlink(missing_ok=True)
                    raise
                finally:
                    self._remove_incomplete(stage)
            cancelled()
            update("preparing")
            environment = active_environment(folder)
            # Environment identity includes the interpreter, not just Python
            # X.Y.
            identity = self.environment_identity(release.artifact.sha256)
            marker = identity_file(folder, environment)
            if (
                not marker.exists()
                or not runtime.python_path(environment).is_file()
                or not self.environment_current(folder)
            ):
                self._remove_incomplete(environment, python_environment=True)
                await runtime.prepare_environment(
                    package,
                    environment,
                    release,
                )
                write_json_atomic(marker, identity)
            cancelled()
            await run_sync_io(binding.prepare, workspace, package, release)
            update("verifying")
            # Smoke calls use a disposable workspace, never the user's data.
            probe = folder / ("probe-" + uuid.uuid4().hex)
            probe.mkdir()
            try:
                receipt = await runtime.verify(
                    package,
                    environment,
                    probe,
                    release,
                )
            finally:
                self._remove_incomplete(probe)
            cancelled()
            update("activating")
            await binding.bind(
                workspace,
                package,
                environment,
                release,
                agent_id,
                receipt,
            )
            await activate(agent_id, receipt)
        except InterruptedError as exc:
            update("cancelled", error=str(exc))
        except asyncio.CancelledError:
            update("interrupted", error="服务停止，重新打开市场后可继续安装")
            raise
        except Exception as exc:
            # Store a bounded diagnostic; never persist environment variables.
            update("failed", error=str(exc)[:3500] or type(exc).__name__)
        finally:
            lock.release()
