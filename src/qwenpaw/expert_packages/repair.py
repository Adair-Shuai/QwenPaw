# -*- coding: utf-8 -*-
"""Prepare a verified replacement; one atomic DriverCard write commits it."""

import asyncio
import hashlib
import json
from pathlib import Path
from typing import Any
import uuid

from filelock import FileLock, Timeout

from ..drivers.storage import AsyncDriverCardStore
from ..utils.io_utils import (
    run_async_to_completion,
    run_sync_io,
    write_json_atomic,
)
from . import binding, runtime
from .environments import active_environment, identity_file
from .source import verify_tree


# Keep the inactive guard, recovery receipt and atomic commit in one scope.
# pylint: disable-next=too-many-branches,too-many-statements
async def repair_environment(service, job_id: str):
    folder = service.path(job_id)
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
            raise InterruptedError("修复已取消，原专家配置和运行环境保持不变")

    try:
        state.update(service.status(job_id))
        previous_candidate = state.get("candidate")
        state.update(
            operation="repair",
            runtime_verified=False,
            error=None,
            problem=None,
        )
        service.started.discard(job_id)
        plan = json.loads((folder / "plan.json").read_text(encoding="utf-8"))
        raw = plan["raw"].encode()
        if (
            plan["channel"] != service.channel.base
            or hashlib.sha256(raw).hexdigest() != job_id
        ):
            raise ValueError("安装计划或渠道已改变，请重新获取安装计划")
        release = service.channel.validate(
            raw,
            plan["signature"],
            service.core_version,
        )
        agent_id = "ep-" + job_id[:20]
        workspace, package = folder / "workspace", folder / "package"
        if (
            await run_sync_io(
                binding.installed_receipt,
                workspace,
                release,
                agent_id,
            )
            is None
        ):
            raise ValueError("专家已删除，请使用重新安装")
        state.update(
            agent_id=agent_id,
            name=release.name,
            version=release.version,
            optional_setup=release.optional_setup,
        )
        await run_sync_io(verify_tree, package, release)
        old_environment = active_environment(folder)
        # A power loss after the atomic card commit needs no second
        # replacement.
        if (
            previous_candidate == old_environment.name
            and service.environment_current(folder)
        ):
            update("repaired", error=None, problem=None)
            return
        store = AsyncDriverCardStore(workspace / "drivers")
        card, revision = await store.load_snapshot(
            "expert-methods",
            protocol="mcp",
        )
        _, old_args = runtime.launch(
            package,
            old_environment,
            workspace,
            release,
        )
        if (
            card.endpoint.get("transport") != "stdio"
            or card.endpoint.get("args") != old_args
            or Path(card.endpoint.get("cwd", "")).resolve()
            != package.resolve()
        ):
            raise ValueError(
                "方法服务启动参数已自定义，不能自动覆盖，请检查专家配置",
            )
        candidate = folder / ("env-" + uuid.uuid4().hex[:12])
        update("repairing", candidate=candidate.name)
        cancelled()
        await runtime.prepare_environment(package, candidate, release)
        cancelled()
        update("repair_verifying")
        probe = folder / ("probe-" + uuid.uuid4().hex)
        probe.mkdir()
        try:
            receipt = await runtime.verify(package, candidate, probe, release)
        finally:
            # pylint: disable-next=protected-access
            service._remove_incomplete(
                probe,
            )  # pylint: disable=protected-access
        write_json_atomic(
            identity_file(folder, candidate),
            {
                "identity": service.environment_identity(
                    release.artifact.sha256,
                ),
                "verification": receipt,
            },
        )
        cancelled()
        async with service.on_repair(agent_id):
            # Recheck identity and user edits immediately before committing.
            if (
                await run_sync_io(
                    binding.installed_receipt,
                    workspace,
                    release,
                    agent_id,
                )
                is None
            ):
                raise ValueError("专家已删除，未切换运行环境")
            cancelled()
            update("repair_committing")
            card.endpoint["command"] = str(runtime.python_path(candidate))
            # Hold the inactive-agent guard until the filesystem worker
            # finishes,
            # even when host shutdown cancels this task during the atomic
            # write.
            if not await run_async_to_completion(
                store.save_if_unchanged(card, revision),
            ):
                raise ValueError(
                    "修复期间方法配置已改变，未覆盖您的设置，请重试",
                )
        update("repaired", verification=receipt, error=None, problem=None)
    except asyncio.CancelledError:
        update("interrupted", error="修复已中断，可继续修复；原工作区保留")
        raise
    except InterruptedError as exc:
        update("cancelled", error=str(exc))
    except Exception as exc:
        update(
            "repair_failed",
            error=str(exc)[:3500] or type(exc).__name__,
            problem={
                "code": "environment_repair",
                "action": "experts",
                "items": [],
            },
        )
    finally:
        # Old environments and candidates remain available for diagnosis. Never
        # remove an interpreter which a committed card may already reference.
        lock.release()
