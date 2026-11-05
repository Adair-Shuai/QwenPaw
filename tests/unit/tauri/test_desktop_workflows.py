# -*- coding: utf-8 -*-
"""Regression tests for desktop packaging workflows."""

import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tomllib

from packaging.specifiers import SpecifierSet
from packaging.version import Version
import pytest
import yaml

REPO_ROOT = Path(__file__).resolve().parents[3]

RELEASE_HELPERS = (
    "scripts/pack/download_desktop_artifacts.sh",
    "scripts/pack/verify_github_release_assets.sh",
    "scripts/pack/oss_copy_with_readback.sh",
    "scripts/pack/generate_oss_metadata.py",
    "scripts/pack-tauri/generate_update_manifest.py",
)


def _load_workflow(name: str) -> dict:
    return yaml.safe_load(
        (REPO_ROOT / ".github" / "workflows" / name).read_text(
            encoding="utf-8",
        ),
    )


@pytest.mark.parametrize(
    ("permission_id", "command"),
    [
        ("desktop-updater-check", "check_desktop_update"),
        ("desktop-updater-check", "check_cached_update"),
        ("desktop-updater-install", "download_desktop_update"),
        ("desktop-updater-install", "install_desktop_update"),
        ("desktop-updater-install", "install_downloaded_update"),
        ("desktop-updater-install", "confirm_desktop_update"),
        ("desktop-updater-install", "restart_for_component_updates"),
    ],
)
def test_desktop_update_commands_are_allowed_by_main_window_acl(
    permission_id: str,
    command: str,
) -> None:
    """Registered update commands also need an enabled frontend permission."""
    native = REPO_ROOT / "console/src-tauri"
    capability = json.loads(
        (native / "capabilities/default.json").read_text(encoding="utf-8"),
    )
    permissions = tomllib.loads(
        (native / "permissions/desktop-updater.toml").read_text(
            encoding="utf-8",
        ),
    )["permission"]
    permission = next(
        item for item in permissions if item["identifier"] == permission_id
    )

    assert "main" in capability["windows"]
    assert "http://127.0.0.1:*" in capability["remote"]["urls"]
    assert permission_id in capability["permissions"]
    assert command in permission["commands"]["allow"]
    assert command not in permission["commands"].get("deny", [])
    registration = (native / "src/lib.rs").read_text(encoding="utf-8")
    assert re.search(rf"\b{command},", registration)


def test_fork_desktop_build_uses_supported_python() -> None:
    """Both platform builders must bootstrap a project-supported Python."""
    project = tomllib.loads(
        (REPO_ROOT / "pyproject.toml").read_text(encoding="utf-8"),
    )
    supported = SpecifierSet(project["project"]["requires-python"])
    workflow = _load_workflow("fork-verify-desktop.yml")

    for job_name in ("tauri-macos", "tauri-windows"):
        setup_python = next(
            step
            for step in workflow["jobs"][job_name]["steps"]
            if step.get("uses", "").startswith("actions/setup-python@")
        )
        version = Version(str(setup_python["with"]["python-version"]))
        assert version in supported, (
            f"{job_name} bootstraps unsupported Python {version}; "
            f"project requires {supported}"
        )


@pytest.mark.parametrize(
    ("workflow_name", "job_name"),
    [
        ("desktop-publish.yml", "upload-release"),
        ("desktop-publish.yml", "upload-oss"),
        ("desktop-promote.yml", "promote-oss"),
    ],
)
def test_publish_jobs_load_infrastructure_from_workflow_revision(
    workflow_name: str,
    job_name: str,
) -> None:
    """Old release targets must not provide the active workflow's helpers."""
    job = _load_workflow(workflow_name)["jobs"][job_name]
    steps = job["steps"]
    infrastructure_checkout = next(
        step
        for step in steps
        if step.get("name") == "Checkout release infrastructure"
    )

    assert infrastructure_checkout["uses"].startswith("actions/checkout@")
    assert infrastructure_checkout["with"] == {
        "ref": "${{ github.workflow_sha }}",
        "path": ".release-infra",
        "sparse-checkout": "scripts\nsrc/qwenpaw/security\n",
        "persist-credentials": False,
    }
    assert job["env"]["RELEASE_INFRA"] == (
        "${{ github.workspace }}/.release-infra"
    )

    target_checkout_index = next(
        index
        for index, step in enumerate(steps)
        if step.get("name") == "Checkout release target"
    )
    infrastructure_checkout_index = steps.index(infrastructure_checkout)
    assert target_checkout_index < infrastructure_checkout_index

    helper_lines = [
        line
        for step in steps
        for line in step.get("run", "").splitlines()
        if any(helper in line for helper in RELEASE_HELPERS)
    ]
    assert helper_lines
    assert all("$RELEASE_INFRA/" in line for line in helper_lines)


def test_download_helper_resolves_verifier_from_its_own_checkout() -> None:
    """The helper must still work when the product checkout has no scripts."""
    script = (
        REPO_ROOT / "scripts/pack/download_desktop_artifacts.sh"
    ).read_text(encoding="utf-8")

    assert 'script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")"' in script
    assert 'python3 "$script_dir/verify_desktop_artifacts.py"' in script
    assert '--brand "$brand"' in script
    assert "run_id=${GITHUB_RUN_ID:-}" in script


@pytest.mark.skipif(
    sys.platform == "win32",
    reason="Desktop manifest upload steps run in Bash on Ubuntu",
)
@pytest.mark.parametrize(
    ("workflow_name", "job_name"),
    [
        ("desktop-promote.yml", "promote-oss"),
        ("desktop-release.yml", "upload-oss"),
    ],
)
@pytest.mark.parametrize(
    ("version", "expected"),
    [
        ("2.3.0", "2.3.0"),
        ("2.3.0.post1", "2.3.0+post.1"),
        ("2.3.0a1", None),
        ("2.3.0b2", None),
        ("2.3.0-beta.2", None),
        ("2.3.0rc1", None),
        ("2.3.0.dev1", None),
        ("2.3.0.post1.dev1", None),
        ("invalid", None),
    ],
)
def test_desktop_updater_manifest_only_publishes_stable_versions(
    tmp_path,
    workflow_name,
    job_name,
    version,
    expected,
) -> None:
    """Execute the real upload step with a local substitute for OSS."""
    steps = _load_workflow(workflow_name)["jobs"][job_name]["steps"]
    step = next(
        step
        for step in steps
        if step.get("name") == "Generate and upload OSS updater manifest"
    )
    script = (
        step["run"]
        .replace(
            "${{ steps.version.outputs.version }}",
            version,
        )
        .replace("${{ inputs.tag }}", "test-release")
    )

    infrastructure = tmp_path / "infra"
    helpers = infrastructure / "scripts/pack"
    helpers.mkdir(parents=True)
    (infrastructure / "scripts/pack-tauri").symlink_to(
        REPO_ROOT / "scripts/pack-tauri",
        target_is_directory=True,
    )
    (helpers / "oss_copy_with_readback.sh").write_text(
        'test "$2" = "oss://test-bucket/metadata/qwenpaw-tauri-latest.json"\n'
        'cp "$1" "$PUBLISHED_MANIFEST"\n',
        encoding="utf-8",
    )
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    gh = bin_dir / "gh"
    gh.write_text("#!/bin/sh\necho 'Test release notes'\n", encoding="utf-8")
    gh.chmod(0o755)
    metadata = tmp_path / "tauri-updater-meta-windows"
    metadata.mkdir()
    (metadata / "installer.exe").write_bytes(b"MZtest")
    (metadata / "installer.exe.sig").write_text("test-signature")
    (metadata / "tauri-windows-x86_64-updater.json").write_text(
        json.dumps(
            {
                "target": "windows-x86_64",
                "artifact": "installer.exe",
                "signature": "installer.exe.sig",
            },
        ),
        encoding="utf-8",
    )
    published = tmp_path / "published.json"
    previous = '{"version": "2.2.2"}\n'
    published.write_text(previous, encoding="utf-8")
    result = subprocess.run(
        [
            "bash",
            "--noprofile",
            "--norc",
            "-e",
            "-o",
            "pipefail",
            "-c",
            script,
        ],
        cwd=tmp_path,
        env={
            **os.environ,
            "PATH": os.pathsep.join(
                (
                    str(bin_dir),
                    str(Path(sys.executable).parent),
                    "/usr/bin",
                    "/bin",
                ),
            ),
            "RELEASE_INFRA": str(infrastructure),
            "OSS_BUCKET": "test-bucket",
            "OSS_PUBLIC_BASE_URL": "https://example.test/desktop",
            "GITHUB_REPOSITORY": "test/repo",
            "RELEASE_BODY": "Test release notes",
            "PUBLISHED_MANIFEST": str(published),
        },
        capture_output=True,
        text=True,
        check=False,
        timeout=10,
    )

    if version == "invalid":
        assert result.returncode != 0
    else:
        assert result.returncode == 0, result.stderr
    if expected is None:
        assert published.read_text(encoding="utf-8") == previous
        assert not (tmp_path / "qwenpaw-tauri-latest-oss.json").exists()
    else:
        manifest = json.loads(published.read_text(encoding="utf-8"))
        assert manifest["version"] == expected
        assert manifest["platforms"]["windows-x86_64"] == {
            "url": "https://example.test/desktop/win-tauri/installer.exe",
            "signature": "test-signature",
        }


def test_nsis_template_avoids_solid_compression() -> None:
    """Large desktop payloads must not use NSIS solid compression."""
    config = json.loads(
        (REPO_ROOT / "console/src-tauri/tauri.conf.json").read_text(
            encoding="utf-8",
        ),
    )
    package_lock = json.loads(
        (REPO_ROOT / "console/package-lock.json").read_text(
            encoding="utf-8",
        ),
    )
    nsis = config["bundle"]["windows"]["nsis"]
    template = (REPO_ROOT / "console/src-tauri" / nsis["template"]).read_text(
        encoding="utf-8",
    )
    tauri_cli_version = package_lock["packages"][
        "node_modules/@tauri-apps/cli"
    ]["version"]

    assert nsis["compression"] == "zlib"
    # This is a version-sync reminder, not an upstream content check.
    # When upgrading the CLI, compare the template with that release.
    assert f"Vendored from Tauri v{tauri_cli_version}" in template
    assert 'SetCompressor "{{compression}}"' in template
    assert "SetCompressor /SOLID" not in template


def test_shared_daemon_keeps_channel_runtime_environment() -> None:
    """A desktop runtime launched through the daemon needs offline channels."""
    native = REPO_ROOT / "console/src-tauri/src"
    commands = (native / "backend/command.rs").read_text(encoding="utf-8")
    collector = (native / "runtime_env.rs").read_text(encoding="utf-8")
    channels = (native / "channel_runtime.rs").read_text(encoding="utf-8")
    runtime = (native / "backend/runtime.rs").read_text(encoding="utf-8")
    daemon = (native / "backend/daemon.rs").read_text(encoding="utf-8")

    # Both development and packaged command factories must use the shared
    # contributor boundary; collecting Computer Use client metadata in
    # runtime::connect alone never delivers these paths to Python.
    factories = re.findall(
        r"pub\(super\) fn create\(.*?(?=\n#\[cfg|\Z)",
        commands,
        re.DOTALL,
    )
    assert len(factories) == 2
    for factory in factories:
        assert "apply_contributed_environment(app, command)" in factory
    contributor = commands.split("fn apply_contributed_environment(", 1)[1]
    assert "crate::runtime_env::collect(app)" in contributor
    assert "command.env(key, value)" in contributor
    assert "crate::channel_runtime::backend_environment(app)" in collector
    for key in (
        "QWENPAW_CHANNEL_RUNTIME_MANIFEST",
        "QWENPAW_CHANNEL_SUPPORT_ROOT",
        "QWENPAW_CHANNEL_DEPENDENCY_PATHS",
    ):
        assert f'"{key}"' in channels

    launch = runtime.split("fn launch(", 1)[1]
    assert "super::command::create(app)?" in launch
    assert '.arg("--agent-host")' in launch
    assert "backend.get_envs()" in launch
    assert "command.env(key, value)" in launch
    assert "command.env_remove(key)" in launch
    assert "Command::new(&program)" in daemon
    assert ".env_clear()" not in daemon


@pytest.mark.parametrize(
    "brand,prefix",
    [("ugsci", "UGSci"), ("qwenpaw", "QwenPaw")],
)
@pytest.mark.parametrize("include_metadata", [False, True])
def test_artifact_selection_retains_fork_brand_and_newest_id(
    monkeypatch,
    brand,
    prefix,
    include_metadata,
):
    """Execute the shipped resolver with duplicate, cross-brand artifacts."""
    script = (
        REPO_ROOT / "scripts/pack/download_desktop_artifacts.sh"
    ).read_text(encoding="utf-8")
    resolver = script.split("python3 -c '\n", 1)[1].split("\n'\n}", 1)[0]
    monkeypatch.setenv("DESKTOP_ARTIFACT_BRAND", brand)
    monkeypatch.setenv(
        "INCLUDE_UPDATER_METADATA",
        str(include_metadata).lower(),
    )
    name = f"{prefix}-Desktop-Tauri-Windows-x64"
    other = "QwenPaw" if prefix == "UGSci" else "UGSci"
    rows = [
        f"10\t2026-11-01T00:00:00Z\t{name}",
        f"11\t2026-11-02T00:00:00Z\t{name}",
        f"12\t2026-11-02T00:00:00Z\t{name}",
        f"99\t2026-11-03T00:00:00Z\t{other}-Desktop-Tauri-Windows-x64",
        "20\t2026-11-02T00:00:00Z\ttauri-updater-meta-windows",
        f"invalid\t2026-11-03T00:00:00Z\t{name}",
        "30\t2026-11-02T00:00:00Z\tunrelated-artifact",
    ]
    result = subprocess.run(
        [sys.executable, "-c", resolver],
        input="\n".join(rows),
        text=True,
        capture_output=True,
        check=True,
    )
    expected = [f"{name}\t12"]
    if include_metadata:
        expected.append("tauri-updater-meta-windows\t20")
    assert result.stdout.splitlines() == expected
    assert "using newest id 12" in result.stderr
    assert "ignoring older 10, 11" in result.stderr


@pytest.mark.parametrize(
    "repository,continues",
    [("Adair-Shuai/QwenPaw", True), ("agentscope-ai/QwenPaw", False)],
)
def test_fork_beta_promotion_retains_checked_desktop_manifest(
    tmp_path,
    monkeypatch,
    repository,
    continues,
):
    """Execute the real manifest gate without running upload commands."""
    import shlex
    import shutil

    workflow = _load_workflow("desktop-promote.yml")
    steps = workflow["jobs"]["promote-oss"]["steps"]
    step = next(
        item
        for item in steps
        if item.get("name") == "Generate and upload OSS updater manifest"
    )
    script = step["run"].split("          RELEASE_BODY=", 1)[0]
    # YAML has already removed the block indentation.
    script = script.split("RELEASE_BODY=", 1)[0]
    script = script.replace("${{ steps.version.outputs.version }}", "2.3.0b3")
    executable = shlex.quote(sys.executable.replace("\\", "/"))
    script = script.replace("python -c", f"{executable} -c")
    for directory, filename in [
        ("tauri-updater-meta-windows", "tauri-windows-x86_64-updater.json"),
        ("tauri-updater-meta-macos", "tauri-darwin-aarch64-updater.json"),
    ]:
        target = tmp_path / directory
        target.mkdir()
        (target / filename).write_text("gate fixture", encoding="utf-8")
    git = Path(shutil.which("git") or "")
    bash = (
        git.parent.parent / "bin/bash.exe"
        if os.name == "nt"
        else Path(shutil.which("bash") or "")
    )
    assert bash.is_file(), "Bash is required to verify the release workflow"
    monkeypatch.setenv("GITHUB_REPOSITORY", repository)
    result = subprocess.run(
        [str(bash), "-c", script + "\necho MANIFEST_GATE_CONTINUED"],
        cwd=tmp_path,
        text=True,
        capture_output=True,
        check=True,
    )
    assert ("MANIFEST_GATE_CONTINUED" in result.stdout) is continues
    assert ("Skipping auto-update manifest" in result.stdout) is not continues
