"""Bounded worker process for trusted local Python snippets.

Cancellation and timeout kill the child process. This is execution isolation,
NOT a security sandbox: use an OS/container sandbox for hostile arbitrary code.
"""
from __future__ import annotations

import asyncio
import json
import math
import os
import sys
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


class ScriptTimeoutError(Exception):
    """The worker exceeded its wall-clock budget and was killed."""


class ScriptExecutionError(Exception):
    """The worker failed or returned an invalid/oversized result."""


@dataclass
class ScriptResult:
    result: Any = None
    locals: dict[str, Any] = field(default_factory=dict)
    stdout: str = ""
    duration_ms: int = 0
    truncated_stdout: bool = False


async def execute_script(
    source: str,
    *,
    inputs: dict[str, Any] | None = None,
    timeout_sec: float = 5.0,
    allow_modules: list[str] | None = None,
    max_stdout: int = 65536,
) -> ScriptResult:
    if not math.isfinite(timeout_sec) or not 0 < timeout_sec <= 30:
        raise ScriptExecutionError("script timeout must be positive and at most 30 seconds")
    try:
        payload = json.dumps({"source": source, "inputs": inputs or {}, "allow_modules": allow_modules or [], "max_stdout": min(65536, max(0, max_stdout))}, allow_nan=False).encode()
    except (ValueError, TypeError) as exc:
        raise ScriptExecutionError("script inputs must be finite JSON values") from exc
    if len(payload) >= 4 * 1024 * 1024:
        raise ScriptExecutionError("script input exceeds 4 MiB")
    start = time.monotonic()
    worker = str(Path(__file__).with_name("script_worker.py"))
    # Application/provider secrets are not passed to the child environment.
    env = {name: os.environ[name] for name in ("SYSTEMROOT", "WINDIR") if name in os.environ}
    with tempfile.TemporaryDirectory(prefix="flowforge-script-") as directory:
        process = await asyncio.create_subprocess_exec(
            sys.executable, "-I", worker, stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
            cwd=directory, env=env,
        )
        try:
            stdout, _stderr = await asyncio.wait_for(process.communicate(payload), timeout=timeout_sec)
        except asyncio.TimeoutError as exc:
            raise ScriptTimeoutError(f"script timed out after {timeout_sec:g}s") from exc
        finally:
            if process.returncode is None:
                process.kill()
                await process.wait()
    try:
        result = json.loads(stdout)
    except (ValueError, UnicodeError) as exc:
        raise ScriptExecutionError("script worker returned invalid output") from exc
    if process.returncode or result.get("error"):
        raise ScriptExecutionError(result.get("error") or f"script worker exited {process.returncode}")
    return ScriptResult(**result, duration_ms=int((time.monotonic() - start) * 1000))


__all__ = ["ScriptExecutionError", "ScriptResult", "ScriptTimeoutError", "execute_script"]
