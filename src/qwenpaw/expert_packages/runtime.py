# -*- coding: utf-8 -*-
"""Offline Python environments and real MCP acceptance probes."""

import asyncio
import json
import hashlib
import math
import os
from pathlib import Path
import sys
import zipfile
from email.parser import BytesParser

from packaging.markers import default_environment
from packaging.requirements import Requirement
from packaging.tags import sys_tags
from packaging.utils import canonicalize_name, parse_wheel_filename
from packaging.version import Version

from .models import Release


def host_python() -> str:
    from ..plugins.loader import _desktop_python, _is_frozen

    if _is_frozen():
        executable = _desktop_python()
        if not executable:
            raise ValueError("桌面 Python 运行环境不可用，请修复或更新宿主")
        return executable
    return sys.executable


def python_path(environment: Path) -> Path:
    return environment / (
        "Scripts/python.exe" if os.name == "nt" else "bin/python"
    )


async def command(args: list[str], timeout: int = 600):
    process = await asyncio.create_subprocess_exec(
        *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        env={
            k: v
            for k, v in os.environ.items()
            if k.upper() not in {"PYTHONPATH", "PYTHONHOME", "PYTHONUSERBASE"}
        },
        creationflags=0x08000000 if os.name == "nt" else 0,
    )
    try:
        output, _ = await asyncio.wait_for(process.communicate(), timeout)
    except BaseException:
        if process.returncode is None:
            # pip --python can have a child interpreter. Stop it before the
            # installer releases its environment lock or cleans partial files.
            import psutil

            try:
                children = psutil.Process(process.pid).children(recursive=True)
                for child in reversed(children):
                    try:
                        child.kill()
                    except psutil.NoSuchProcess:
                        pass
                psutil.wait_procs(children, timeout=5)
            except psutil.NoSuchProcess:
                pass
            process.kill()
        await process.wait()
        raise
    if process.returncode:
        raise ValueError(
            "运行环境准备失败: " + output.decode(errors="replace")[-3000:],
        )


async def prepare_environment(
    package: Path,
    environment: Path,
    release: Release,
):
    validate_wheels(package, release)
    executable = python_path(environment)
    installer = host_python()
    await command([installer, "-m", "venv", "--without-pip", str(environment)])
    # Install only signed local wheels, never an index or sdist.
    # A missing transitive dependency therefore fails rather than leaking into
    # the host site-packages or compiling code on the user's computer.
    folders = sorted(
        {str((package / wheel).parent) for wheel in release.wheels},
    )
    await command(
        [
            installer,
            "-m",
            "pip",
            "--isolated",
            "--python",
            str(executable),
            "install",
            "--no-index",
            "--no-deps",
            "--ignore-installed",
            "--only-binary=:all:",
            "--no-compile",
            "--no-cache-dir",
            *[arg for folder in folders for arg in ("--find-links", folder)],
            *[str(package / wheel) for wheel in release.wheels],
        ],
    )


def validate_wheels(package: Path, release: Release):
    """Check the full active dependency closure without executing wheel code.

    pip's --no-index does not prohibit direct URLs in wheel metadata. Use
    --no-deps after this closed-set validation, including propagated extras.
    """
    distributions = {}
    tags = set(sys_tags())
    for wheel in release.wheels:
        name, version, _, wheel_tags = parse_wheel_filename(Path(wheel).name)
        if not tags.intersection(wheel_tags) or name in distributions:
            raise ValueError("Duplicate or incompatible wheel")
        with zipfile.ZipFile(package / wheel) as archive:
            entries = [
                p
                for p in archive.namelist()
                if p.endswith(".dist-info/METADATA")
            ]
            if len(entries) != 1:
                raise ValueError("Invalid wheel metadata")
            meta = BytesParser().parsebytes(archive.read(entries[0]))
        if (
            canonicalize_name(meta["Name"]) != name
            or Version(meta["Version"]) != version
        ):
            raise ValueError("Wheel identity mismatch")
        distributions[name] = (version, meta.get_all("Requires-Dist", []))
    extras = {name: {""} for name in distributions}
    changed = True
    while changed:
        changed = False
        for name, (_, requirements) in distributions.items():
            for raw in requirements:
                req = Requirement(raw)
                if req.marker and not any(
                    req.marker.evaluate(
                        {**default_environment(), "extra": extra},
                    )
                    for extra in extras[name]
                ):
                    continue
                dependency = canonicalize_name(req.name)
                if (
                    req.url
                    or dependency not in distributions
                    or distributions[dependency][0] not in req.specifier
                ):
                    raise ValueError(
                        (
                            "Offline dependency is missing or incompatible:"
                            f" {req.name}"
                        ),
                    )
                before = len(extras[dependency])
                extras[dependency].update(req.extras)
                changed |= before != len(extras[dependency])


def launch(
    package: Path,
    environment: Path,
    workspace: Path,
    release: Release,
):
    return str(python_path(environment)), [
        "-E",
        "-s",
        "-B",
        str(package / release.mcp.entrypoint),
        *[a.replace("${workspace}", str(workspace)) for a in release.mcp.args],
    ]


def assert_expected(actual, expected):
    if isinstance(expected, dict):
        if not isinstance(actual, dict):
            raise ValueError("方法自检未返回结构化结果")
        for key, value in expected.items():
            if key not in actual:
                raise ValueError(f"方法自检缺少字段: {key}")
            assert_expected(actual[key], value)
    elif isinstance(expected, (int, float)) and not isinstance(expected, bool):
        if (
            isinstance(actual, bool)
            or not isinstance(actual, (int, float))
            or not math.isclose(actual, expected, rel_tol=1e-9, abs_tol=1e-9)
        ):
            raise ValueError("方法自检数值不符合预期")
    elif actual != expected:
        raise ValueError("方法自检结果不符合预期")


async def verify(
    package: Path,
    environment: Path,
    workspace: Path,
    release: Release,
):
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    executable, args = launch(package, environment, workspace, release)
    async with asyncio.timeout(90):
        async with stdio_client(
            StdioServerParameters(
                command=executable,
                args=args,
                cwd=str(package),
                env={"PYTHONDONTWRITEBYTECODE": "1"},
            ),
        ) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                tools = []
                cursor = None
                cursors = set()
                while True:
                    page = await session.list_tools(cursor=cursor)
                    tools.extend(page.tools)
                    if len(tools) > 100:
                        raise ValueError("MCP 工具数量超出专家包限制")
                    cursor = page.nextCursor
                    if cursor is None:
                        break
                    if cursor in cursors or len(cursors) >= 100:
                        raise ValueError("MCP 工具分页无效")
                    cursors.add(cursor)
                names = {tool.name for tool in tools}
                if set(release.mcp.tools) != names or len(names) != len(tools):
                    raise ValueError("MCP 工具集合与专家声明不一致")
                schemas = {
                    tool.name: hashlib.sha256(
                        json.dumps(
                            {
                                "input": tool.inputSchema,
                                "output": tool.outputSchema,
                            },
                            sort_keys=True,
                            separators=(",", ":"),
                        ).encode(),
                    ).hexdigest()
                    for tool in tools
                    if tool.name in release.mcp.tools
                }
                if release.mcp.schemas and schemas != release.mcp.schemas:
                    raise ValueError("MCP 工具契约与发布时不一致")
                for check in release.mcp.smoke:
                    result = await session.call_tool(
                        check.tool,
                        check.arguments,
                    )
                    if result.isError:
                        raise ValueError(f"方法自检失败: {check.tool}")
                    structured = result.structuredContent
                    if structured is None:
                        text = "".join(
                            c.text for c in result.content if c.type == "text"
                        )
                        structured = json.loads(text)
                    assert_expected(structured, check.expected)
                return {
                    "tools": sorted(names),
                    "checks": len(release.mcp.smoke),
                    "schemas": schemas,
                }
