# -*- coding: utf-8 -*-
"""Execute the real promotion workflow against isolated OSS objects."""

import hashlib
import json
import os
from pathlib import Path
import runpy
import shutil
import subprocess
import sys

import pytest
import yaml


ROOT = Path(__file__).resolve().parents[3]
VERSION = "2.3.0b3"
ROLES = (
    ("win-tauri", "Windows-updater.exe", "UGSci-Desktop-Tauri-Windows-test"),
    ("win-tauri", "Windows-portable.zip", "UGSci-Desktop-Tauri-Windows-test"),
    ("mac-tauri", "macOS.zip", "UGSci-Desktop-Tauri-macOS-test"),
    ("mac-tauri", "macOS.app.tar.gz", "tauri-updater-meta-macos"),
)
FAKE_OSS = '''"""Fake OSS transport with real file copies."""
import json
import os
from pathlib import Path
import shutil
import sys

command, *args = sys.argv[1:]
root = Path(os.environ["PROMOTION_OBJECTS"])
with Path(os.environ["PROMOTION_CALLS"]).open("a", encoding="utf-8") as log:
    log.write(json.dumps([command, *args]) + "\\n")

def local(value):
    prefix = "oss://test-bucket/"
    if value.startswith(prefix):
        return root / value[len(prefix):]
    return Path(value)

if command == "cp":
    source, target = map(local, args[:2])
    if not source.is_file():
        raise SystemExit("missing source: " + str(source))
    if target.exists() and "--force" not in args:
        print("overwrite prompt defaults to skip; success with skip 1 object")
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
elif command == "ls":
    if not local(args[0]).is_file():
        raise SystemExit("missing object: " + args[0])
elif command == "rm":
    local(args[0]).unlink(missing_ok=True)
else:
    raise SystemExit("unexpected ossutil command: " + command)
'''


def _bash():
    """Select native Git Bash on Windows instead of the WSL launcher."""
    if os.name == "nt":
        git = shutil.which("git")
        assert git, "Git Bash is required to execute release workflow tests"
        for relative in ("bin/bash.exe", "usr/bin/bash.exe"):
            candidate = Path(git).resolve().parents[1] / relative
            if candidate.is_file():
                return str(candidate)
        raise AssertionError("Git installation has no native Bash executable")
    bash = shutil.which("bash")
    assert bash, "Bash is required to execute release workflow tests"
    return bash


class Promotion:
    """Local immutable artifacts and a fake transport for the actual shell."""

    def __init__(self, root):
        self.root = root
        self.objects = root / "oss"
        self.runtime = root / "runtime"
        self.runtime.mkdir()
        self.calls = root / "calls.jsonl"
        self.artifacts = []
        generate = runpy.run_path(
            str(ROOT / "scripts/pack/generate_oss_metadata.py"),
        )["generate_metadata"]
        for index, (platform, role, directory) in enumerate(ROLES):
            name = f"UGSci-Tauri-{VERSION}-{role}"
            artifact = root / directory / name
            artifact.parent.mkdir(exist_ok=True)
            artifact.write_bytes(bytes([index + 1]) * (17 + index * 19))
            document = generate(
                str(artifact),
                "desktop",
                platform,
                VERSION,
                "2026-11-03",
            )
            binary = self.object_path(platform, name)
            binary.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(artifact, binary)
            metadata = self.object_path(platform, name, metadata=True)
            metadata.parent.mkdir(parents=True, exist_ok=True)
            metadata.write_text(json.dumps(document), encoding="utf-8")
            self.artifacts.append((platform, role, artifact, metadata))
        (root / "fake-oss.py").write_text(FAKE_OSS, encoding="utf-8")

    def object_path(self, platform, name, *, metadata=False):
        category = "metadata" if metadata else "files"
        suffix = ".json" if metadata else ""
        return (
            self.objects
            / category
            / "apps/desktop"
            / platform
            / (name + suffix)
        )

    def run(self):
        workflow = yaml.safe_load(
            (ROOT / ".github/workflows/desktop-promote.yml").read_text(
                encoding="utf-8",
            ),
        )
        step = next(
            step
            for step in workflow["jobs"]["promote-oss"]["steps"]
            if step.get("name") == "Promote versioned files to latest"
        )
        script = step["run"].replace(
            "${{ steps.version.outputs.version }}",
            VERSION,
        )
        # Execute every actual invocation, not a reimplementation of the
        # workflow function. Only ossutil's external transport is controlled.
        header = (
            "set -euo pipefail\n"
            'python() { command "$PROMOTION_PYTHON" "$@"; }\n'
            'ossutil() { python "$PROMOTION_FAKE" "$@"; }\n'
        )
        script_path = self.root / "promote.sh"
        script_path.write_text(header + script, encoding="utf-8")
        environment = {
            **os.environ,
            "OSS_BUCKET": "test-bucket",
            "RUNNER_TEMP": self.runtime.as_posix(),
            "GITHUB_RUN_ID": "12345",
            "GITHUB_RUN_ATTEMPT": "1",
            "PROMOTION_PYTHON": Path(sys.executable).as_posix(),
            "PROMOTION_FAKE": (self.root / "fake-oss.py").as_posix(),
            "PROMOTION_OBJECTS": str(self.objects),
            "PROMOTION_CALLS": str(self.calls),
            "MSYS2_ARG_CONV_EXCL": "oss://",
        }
        return subprocess.run(
            [_bash(), "--noprofile", "--norc", str(script_path)],
            cwd=self.root,
            env=environment,
            text=True,
            capture_output=True,
            timeout=30,
            check=False,
        )

    def assert_aliases(self):
        for platform, role, artifact, metadata in self.artifacts:
            canonical = json.loads(metadata.read_text(encoding="utf-8"))
            latest = f"UGSci-Tauri-latest-{role}"
            alias = json.loads(
                self.object_path(platform, latest, metadata=True).read_text(
                    encoding="utf-8",
                ),
            )
            expected = {
                **canonical,
                "filename": latest,
                "url": f"/files/apps/desktop/{platform}/{latest}",
            }
            assert alias == expected
            actual = self.object_path(platform, latest).read_bytes()
            assert actual == artifact.read_bytes()
            assert alias["sha256"] == hashlib.sha256(actual).hexdigest()
            assert alias["size_bytes"] == len(actual)


@pytest.fixture(name="promotion")
def promotion_fixture(tmp_path):
    return Promotion(tmp_path)


def test_four_role_aliases_preserve_each_canonical_artifact(promotion):
    immutable = {
        path: path.read_bytes()
        for path in promotion.objects.rglob("*")
        if path.is_file()
    }

    result = promotion.run()

    assert result.returncode == 0, result.stdout + result.stderr
    promotion.assert_aliases()
    assert all(
        path.read_bytes() == content for path, content in immutable.items()
    )
    calls = [
        json.loads(line) for line in promotion.calls.read_text().splitlines()
    ]
    downloads = [
        call
        for call in calls
        if call[0] == "cp"
        and call[1].endswith(".json")
        and not call[2].startswith("oss://")
    ]
    assert len(downloads) == len({call[2] for call in downloads}) == 4
    assert all("--force" in call for call in downloads)


def test_alias_promotion_replaces_stale_metadata_and_is_repeatable(promotion):
    for platform, _role, artifact, _metadata in promotion.artifacts:
        for name in (
            f"{platform}-versioned-metadata.json",
            f"{artifact.name}-versioned-metadata.json",
        ):
            (promotion.runtime / name).write_text('{"stale": true}')

    first = promotion.run()
    assert first.returncode == 0, first.stdout + first.stderr
    promotion.assert_aliases()
    second = promotion.run()
    assert second.returncode == 0, second.stdout + second.stderr
    promotion.assert_aliases()


@pytest.mark.parametrize(
    ("field", "invalid"),
    [
        ("product", "cli"),
        ("platform", "mac-tauri"),
        ("version", "2.3.0b2"),
        ("filename", "UGSci-Tauri-2.3.0b3-Windows-portable.zip"),
        ("url", "/files/apps/desktop/win-tauri/wrong.exe"),
        ("size_bytes", 999),
        ("size_bytes", "17"),
        ("sha256", "0" * 64),
    ],
)
def test_canonical_metadata_is_validated_before_alias_write(
    promotion,
    field,
    invalid,
):
    _platform, _role, _artifact, metadata = promotion.artifacts[0]
    document = json.loads(metadata.read_text(encoding="utf-8"))
    document[field] = invalid
    metadata.write_text(json.dumps(document), encoding="utf-8")

    result = promotion.run()

    assert result.returncode != 0, result.stdout + result.stderr
    assert not list(promotion.objects.rglob("*latest*"))
    assert not list(promotion.objects.rglob("*staging*"))


@pytest.mark.parametrize("mismatch", ["filename", "bytes"])
def test_selected_artifact_must_match_canonical_file(promotion, mismatch):
    _platform, _role, artifact, _metadata = promotion.artifacts[0]
    if mismatch == "filename":
        artifact.rename(
            artifact.with_name(artifact.name.replace(VERSION, "old")),
        )
    else:
        artifact.write_bytes(b"changed after canonical metadata generation")

    result = promotion.run()

    assert result.returncode != 0, result.stdout + result.stderr
    assert not list(promotion.objects.rglob("*latest*"))
    assert not list(promotion.objects.rglob("*staging*"))
