# -*- coding: utf-8 -*-
"""Core release command regression tests."""

from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import sys
from unittest.mock import Mock

REPO_ROOT = Path(__file__).resolve().parents[3]


def test_core_release_resumes_from_the_origin_repository(
    tmp_path,
    monkeypatch,
):
    spec = spec_from_file_location(
        "core_resume_test",
        REPO_ROOT / "scripts/pack/prepare_core_release.py",
    )
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    local_ref = "codex/release-candidate"
    repository = "owner/fork"
    origin = f"https://github.com/{repository}.git"
    commit = "a" * 40
    tag = "v2.3.1-beta.2"
    draft = {
        "id": 42,
        "tag_name": tag,
        "draft": True,
        "target_commitish": commit,
    }
    command = Mock(
        side_effect=[
            str(tmp_path),
            local_ref,
            origin,
            repository,
            json.dumps([[draft]]),
            commit,
            "",
        ],
    )
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(
        sys,
        "argv",
        ["prepare_core_release.py", "--resume", tag],
    )
    monkeypatch.setattr(module, "command", command)

    module.main()

    command.assert_any_call("git", "remote", "get-url", "origin")
    command.assert_any_call(
        "gh",
        "repo",
        "view",
        origin,
        "--json",
        "nameWithOwner",
        "--jq",
        ".nameWithOwner",
    )
    command.assert_called_with(
        "gh",
        "workflow",
        "run",
        "release-resume.yml",
        "--repo",
        repository,
        "--ref",
        local_ref,
        "-f",
        f"tag={tag}",
        "-f",
        "release_id=42",
    )
