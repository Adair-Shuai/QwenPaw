# -*- coding: utf-8 -*-
"""Stage the base reservoir expert and native wheels for build_expert_release.

Downloads only on the build machine; no credentials or user knowledge copied.
"""

import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys

from qwenpaw.__version__ import __version__
from qwenpaw.components.update import detect_target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    expert = root / "packages/ugsci-reservoir-expert"
    output = args.output.resolve()
    # Fresh directory only: never erase a user's existing staging tree.
    output.mkdir(parents=True, exist_ok=False)
    payload = output / "payload"
    payload.mkdir()
    for name in ("server.py", "expert.py", "package_server.py"):
        shutil.copy2(expert / name, payload / name)
    shutil.copytree(
        expert / "skills",
        payload / "skills",
        ignore=shutil.ignore_patterns("__pycache__", "*.pyc"),
    )
    prompt = (expert / "EXPERT_PROMPT.md").read_text(encoding="utf-8")
    prompt = prompt.replace(
        "知识使用 reservoir_knowledge_search；",
        "本基础包未接入私有手册检索，知识查询需另行配置；",
    )
    (payload / "AGENTS.md").write_text(prompt, encoding="utf-8")
    wheels = payload / "wheels"
    wheels.mkdir()
    subprocess.run(
        [
            sys.executable,
            "-m",
            "pip",
            "wheel",
            "--wheel-dir",
            str(wheels),
            str(root / "packages/ugsci-reservoir-io"),
            "-r",
            str(expert / "requirements.txt"),
        ],
        check=True,
    )
    spec = {
        "schema_version": 1,
        "id": "ugsci.reservoir-simulation-expert",
        "version": "0.1.1",
        "name": "油藏数值模拟专家",
        "description": "基础读写、历史拟合评分、实验设计、方案排序与经济评价",
        "core_min": __version__,
        "target": detect_target(),
        "python": f"3.{sys.version_info.minor}",
        "instructions": "AGENTS.md",
        "skills": sorted(
            p.relative_to(payload).as_posix()
            for p in (payload / "skills").iterdir()
            if p.is_dir()
        ),
        "wheels": sorted(
            p.relative_to(payload).as_posix() for p in wheels.glob("*.whl")
        ),
        "mcp": {
            "entrypoint": "package_server.py",
            "args": ["--workspace", "${workspace}"],
            "tools": [
                "reservoir_tool_schemas",
                "reservoir_io_call",
                "reservoir_history_score",
                "reservoir_experiment_design",
                "reservoir_rank_candidates",
                "reservoir_economic_npv",
                "reservoir_package_selftest",
            ],
            "smoke": [
                {
                    "tool": "reservoir_package_selftest",
                    "arguments": {},
                    "expected": {
                        "npv": 0,
                        "verified": True,
                        "pressure": [12.5, 16.75],
                        "unit": "MPa",
                    },
                },
            ],
        },
        "optional_setup": [
            "商业模拟器与许可证",
            "私有手册索引",
            "二进制格式扩展与 deckcheck",
        ],
    }
    (output / "recipe.json").write_text(
        json.dumps(spec, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(str(output / "recipe.json"))


if __name__ == "__main__":
    main()
