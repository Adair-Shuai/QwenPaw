# -*- coding: utf-8 -*-
"""Regression guards for safe release artifact resume and replacement."""

from __future__ import annotations

from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import subprocess
import hashlib
import zipfile

import pytest
import yaml

REPO_ROOT = Path(__file__).resolve().parents[3]


def _workflow(name: str) -> str:
    return (REPO_ROOT / ".github" / "workflows" / name).read_text(
        encoding="utf-8",
    )


@pytest.mark.parametrize(
    "job_name,build_script",
    [
        ("build-tauri-windows", "build_win_pyinstaller.ps1"),
        ("build-tauri-macos", "build_macos_pyinstaller.sh"),
    ],
)
def test_desktop_packaging_helpers_install_icon_dependencies(
    job_name,
    build_script,
):
    """Native icon validation uses the packaging helper interpreter."""
    steps = yaml.safe_load(_workflow("desktop-build.yml"))["jobs"][job_name][
        "steps"
    ]
    helper = next(
        step
        for step in steps
        if step.get("name") == "Install packaging helper dependencies"
    )
    build = next(step for step in steps if build_script in step.get("run", ""))
    assert 'python -m pip install packaging "Pillow>=10.0.0"' in helper["run"]
    assert steps.index(helper) < steps.index(build)


def test_backend_units_install_only_the_locked_native_icon_renderer():
    steps = yaml.safe_load(_workflow("full-tests-nightly.yml"))["jobs"][
        "unit-tests"
    ]["steps"]
    renderer = next(
        step
        for step in steps
        if step.get("name") == "Install locked native icon renderer"
    )
    unit_tests = next(
        step for step in steps if step.get("name") == "Run unit tests"
    )
    assert (
        "packages['node_modules/@tauri-apps/cli'].version" in renderer["run"]
    )
    assert 'npm install --prefix "$renderer_root"' in renderer["run"]
    assert (
        '--no-save --ignore-scripts "@tauri-apps/cli@$renderer_version"'
        in renderer["run"]
    )
    assert "fs.symlinkSync(source, target" in renderer["run"]
    assert steps.index(renderer) < steps.index(unit_tests)
    dmg = next(
        step
        for step in steps
        if step.get("name") == "Install macOS DMG regression dependencies"
    )
    assert dmg["if"] == "runner.os == 'macOS'"
    assert "requirements-macos-dmg.txt" in dmg["run"]
    assert steps.index(dmg) < steps.index(unit_tests)


def test_windows_release_cleanup_uses_native_owned_pid(tmp_path):
    import os
    import shutil

    if os.name != "nt":
        pytest.skip("Executes the Windows PowerShell cleanup branch")
    shell = shutil.which("pwsh") or shutil.which("powershell")
    assert shell, "PowerShell is required for Windows release verification"
    workflow = yaml.safe_load(_workflow("release-verify.yml"))
    steps = [
        step
        for job in workflow["jobs"].values()
        for step in job.get("steps", [])
        if step.get("name") == "Stop server"
    ]
    assert len(steps) == 2
    for index, step in enumerate(steps):
        directory = tmp_path / str(index)
        directory.mkdir()
        pid_file = directory / "qwenpaw.pid"
        pid_file.write_text("12345", encoding="ascii")
        probe = directory / "probe.ps1"
        probe.write_text(
            """
$script:stopped = @()
function Stop-Process {
  [CmdletBinding()] param([int]$Id, [switch]$Force)
  $script:stopped += $Id
}
function Get-NetTCPConnection {
  [CmdletBinding()] param($LocalPort, $State)
  [pscustomobject]@{OwningProcess=9876}
}
function Get-CimInstance {
  [CmdletBinding()] param($ClassName, $Filter)
  [pscustomobject]@{
    ExecutablePath=(Join-Path $installRoot 'venv/python.exe')
    CommandLine='python -m qwenpaw app'
  }
}
"""
            + step["run"].rsplit("exit 0", 1)[0]
            + "\n$script:stopped | ConvertTo-Json -Compress\n",
            encoding="utf-8",
        )
        result = subprocess.run(
            [
                shell,
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(probe),
            ],
            env={
                **os.environ,
                "RUNNER_OS": "Windows",
                "RUNNER_TEMP": str(directory),
            },
            capture_output=True,
            text=True,
            timeout=30,
            check=False,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        assert result.returncode == 0, result.stdout + result.stderr
        assert json.loads(result.stdout) == 9876
        assert not pid_file.exists()


def test_clean_release_and_frontend_checks_build_openui_runtime() -> None:
    for name, gate in (
        ("plugins-release.yml", "Pack plugins and build index"),
        ("frontend-tests.yml", "Verify fork feature regression inventory"),
        ("full-tests-nightly.yml", "Verify fork feature regression inventory"),
    ):
        workflow = _workflow(name)
        assert (
            "npm --prefix plugins/bundle/qwenpaw-openui/frontend ci"
            in workflow
        )
        assert workflow.index(
            "npm --prefix plugins/bundle/qwenpaw-openui/frontend test",
        ) < workflow.index(gate)
        if name in {"frontend-tests.yml", "full-tests-nightly.yml"}:
            # Mounted Run Center tests consume the generated charts module.
            assert "npm --prefix plugins/bundle/qwenpaw-run-center/ui ci" in (
                workflow
            )
            assert workflow.index(
                "npm --prefix plugins/bundle/qwenpaw-run-center/ui run build",
            ) < workflow.index(gate)
            assert workflow.index(
                "scripts/sync_run_center_bundle.py --sync",
            ) < workflow.index(gate)
    for suffix in ("sh", "ps1"):
        helper = (
            REPO_ROOT / "scripts" / "pack-tauri" / f"build_plugin_uis.{suffix}"
        )
        text = helper.read_text(encoding="utf-8")
        assert "qwenpaw-openui/frontend" in text
        assert "system-prompt.txt" in text
        assert "npm ci --prefix" in text and "npm run build --prefix" in text
    for name, gate in (
        ("release-resume.yml", "Build package"),
        ("publish-pypi.yml", "Build package"),
        ("fork-verify.yml", "Build package"),
        ("release-verify.yml", "Run install script (Linux/macOS)"),
    ):
        workflow = _workflow(name)
        assert workflow.index(
            "Build and stage bundled OpenUI runtime",
        ) < workflow.index(gate)
        assert "npm --prefix plugins/bundle/qwenpaw-openui/frontend test" in (
            workflow
        )
        assert "stage_bundled_plugins.py --repo . --dest" in workflow
        assert (
            "cp -R .codex-tmp/wheel-plugin-stage/qwenpaw-openui "
            "src/qwenpaw/plugins_bundle/" in workflow
        )
        for asset in ("index.js", "system-prompt.txt"):
            assert (
                "test -s src/qwenpaw/plugins_bundle/qwenpaw-openui/"
                f"dist/{asset}" in workflow
            )


def test_reusable_plugin_build_matches_release_artifact_scope() -> None:
    for name in ("plugins-release.yml",):
        workflow = _workflow(name)
        pack = workflow.index("Pack plugins and build index")
        for stage in (
            "Build memory plugin frontends",
            "Build Run Center frontend",
        ):
            assert workflow.index(stage) < pack
        assert "for frontend_dir in plugins/memory/*/frontend; do" in workflow
        for command in ("ci", "run build"):
            assert f'npm --prefix "$frontend_dir" {command}' in workflow
            assert (
                f"npm --prefix plugins/bundle/qwenpaw-run-center/ui {command}"
                in workflow
            )
        assert "--exclude-apps" in workflow[pack:]


@pytest.mark.parametrize(
    "workflow_name,job",
    [
        ("plugins-release.yml", "upload-oss"),
    ],
)
def test_plugin_pack_jobs_install_channel_contract_dependencies(
    workflow_name,
    job,
) -> None:
    """Each clean runner installs the real validator's lightweight imports."""
    workflow = yaml.safe_load(_workflow(workflow_name))
    steps = workflow["jobs"][job]["steps"]
    pack_index = next(
        index
        for index, step in enumerate(steps)
        if "scripts/pack/generate_plugin_metadata.py" in step.get("run", "")
    )
    install = (
        "python -m pip install -r "
        "scripts/pack/channel-contract-requirements.txt"
    )
    prerequisites = [
        step for step in steps[:pack_index] if install in step.get("run", "")
    ]
    assert prerequisites, f"{workflow_name}:{job} omits preflight dependencies"
    for step in [*prerequisites, steps[pack_index]]:
        assert not step.get("continue-on-error", False)
    assert any("if" not in step for step in prerequisites)


def test_resumed_wheel_validates_contracts_and_stages_tested_openui() -> None:
    workflow = yaml.safe_load(_workflow("release-resume.yml"))
    steps = workflow["jobs"]["build-wheel"]["steps"]
    indexes = {step.get("name"): index for index, step in enumerate(steps)}
    install = indexes["Install channel contract preflight dependencies"]
    stage = indexes["Build and stage bundled OpenUI runtime"]
    build = indexes["Build package"]
    assert install < stage < build
    assert (
        "python -m pip install -r "
        "scripts/pack/channel-contract-requirements.txt"
    ) in steps[install]["run"]
    runtime = steps[stage]["run"]
    commands = [
        "npm --prefix plugins/bundle/qwenpaw-openui/frontend ci",
        "npm --prefix plugins/bundle/qwenpaw-openui/frontend test",
        "python scripts/pack-tauri/stage_bundled_plugins.py --repo . --dest",
        "cp -R .codex-tmp/wheel-plugin-stage/qwenpaw-openui "
        "src/qwenpaw/plugins_bundle/",
    ]
    positions = [runtime.index(command) for command in commands]
    assert positions == sorted(positions)
    for asset in ("index.js", "system-prompt.txt"):
        assert (
            "test -s src/qwenpaw/plugins_bundle/qwenpaw-openui/"
            f"dist/{asset}"
        ) in runtime
    package = steps[build]["run"]
    assert package.index(
        "python scripts/pack/validate_channel_contracts.py",
    ) < package.index("python -m build")
    for index in (install, stage, build):
        assert "if" not in steps[index]
        assert not steps[index].get("continue-on-error", False)


def test_release_builds_run_center_and_docker_runtime_dependencies() -> None:
    release = _workflow("release-resume.yml")
    resumable = _workflow("release-resume.yml")
    standalone = _workflow("plugins-release.yml")
    dockerfile = (REPO_ROOT / "deploy" / "Dockerfile").read_text(
        encoding="utf-8",
    )

    for workflow in (release, resumable, standalone):
        assert (
            "npm --prefix plugins/bundle/qwenpaw-run-center/ui ci" in workflow
        )
        assert (
            "npm --prefix plugins/bundle/qwenpaw-run-center/ui run build"
            in workflow
        )
        stage = (
            "Build Run Center frontend"
            if workflow == standalone
            else "Build bundled Run Center frontend"
        )
        gate = (
            "Pack plugins and build index"
            if workflow == standalone
            else "Build package"
        )
        assert workflow.index(stage) < workflow.index(gate)
    assert (
        "COPY scripts/pack-tauri/runtime_staging.py /tmp/runtime_staging.py"
        in dockerfile
    )
    assert (
        "COPY scripts/pack-tauri/copy_windows_tree.py "
        "/tmp/copy_windows_tree.py" in dockerfile
    )
    assert (
        "rm /tmp/stage_python_runtime.py /tmp/runtime_staging.py "
        "/tmp/copy_windows_tree.py"
    ) in dockerfile
    assert "beta|alpha|rc|dev" in release


def test_resumable_release_publish_waits_for_full_test_gate() -> None:
    release = _workflow("release-resume.yml")
    for job, following in (
        ("publish-desktop", "publish-components"),
        ("publish-components", "full-test-gate"),
    ):
        block = release.split(f"  {job}:\n", 1)[1].split(
            f"  {following}:\n",
            1,
        )[0]
        assert "cleanup-draft-immutable-artifacts, full-test-gate]" in block
        assert "needs.full-test-gate.result == 'success'" in block


def test_distribution_builds_embed_run_center_frontend() -> None:
    for workflow in (
        "release-resume.yml",
        "publish-pypi.yml",
        "fork-verify.yml",
        "release-verify.yml",
    ):
        text = _workflow(workflow)
        assert text.index("Build bundled Run Center frontend") < text.index(
            (
                "python -m build"
                if workflow != "release-verify.yml"
                else "Run install script"
            ),
        )
        assert "python scripts/sync_run_center_bundle.py --sync" in text
        assert (
            "test -s src/qwenpaw/plugins_bundle/"
            "qwenpaw-run-center/ui/dist/index.js" in text
        )
    dockerfile = (REPO_ROOT / "deploy" / "Dockerfile").read_text(
        encoding="utf-8",
    )
    assert "npm --prefix /app/run-center-ui run build" in dockerfile
    assert (
        "COPY --from=console-builder /app/run-center-ui/dist/ "
        "./src/qwenpaw/plugins_bundle/qwenpaw-run-center/ui/dist/"
    ) in dockerfile


def test_resumed_artifacts_must_match_release_commit_and_metadata() -> None:
    release = _workflow("release-resume.yml")
    components = _workflow("component-release.yml")

    assert 'source_path="$(jq -r .path' in release
    assert (
        'if [ "$source_path" != ".github/workflows/release-resume.yml" ]'
        in release
    )
    assert 'if [ "$source_sha" != "$sha" ]' in release
    assert "validate_artifact_reuse_diff" in release
    assert "Cannot reuse artifacts across product change" in release
    assert 'require_source_job_success "build-wheel"' in release
    assert 'require_source_gate_prefix "verify-web / "' in release
    assert (
        'require_source_job_success "build-desktop / build-tauri-windows"'
        in release
    )
    assert (
        'require_source_job_success "build-desktop / build-tauri-macos"'
        in release
    )
    assert 'if [ "$source_conclusion" != "success" ]' not in release
    assert "verify_cleanup_only_failure" in release
    assert "only Stop server cleanup was incomplete" in release
    assert 'validate_artifact_reuse_diff "$windows_sha" "$sha"' in release
    assert 'validate_artifact_reuse_diff "$replacement_sha" "$sha"' in release
    assert "grep -qx 'tauri-updater-meta-windows'" in release
    assert "grep -qx 'tauri-updater-meta-macos'" in release
    assert "Replacement artifact run IDs require artifacts_run_id" in release
    assert (
        "Desktop layout changes require Windows, macOS, and component "
        "replacement artifacts" in release
    )
    assert "scripts/pack-tauri/assemble_desktop_layout.py" in release
    native_changes = release.split(
        "scripts/pack-tauri/assemble_desktop_layout.py|",
        1,
    )[1].split(";;", 1)[0]
    assert "scripts/pack-tauri/windows_portable_bootstrap.cs" in native_changes
    for variable in (
        "WINDOWS_ARTIFACTS_RUN_ID",
        "MACOS_ARTIFACTS_RUN_ID",
        "COMPONENTS_ARTIFACTS_RUN_ID",
    ):
        assert f'[ -z "${variable}" ]' in native_changes
    assert "scripts/pack-tauri/stage_node_runtime.py" in release
    assert "tests/unit/tauri/test_stage_node_runtime.py" in release
    assert release.count('[ -z "$WINDOWS_ARTIFACTS_RUN_ID" ]') >= 1
    assert release.count('[ -z "$MACOS_ARTIFACTS_RUN_ID" ]') >= 1
    assert release.count('[ -z "$COMPONENTS_ARTIFACTS_RUN_ID" ]') >= 1
    assert release.count(".github/workflows/desktop-build.yml") >= 2
    assert "plugins_artifacts_run_id" not in release
    assert ".github/workflows/component-release.yml" in release
    assert 'grep -Fqx "build-tauri-windows"$\'\\t\'"success"' in release
    assert 'grep -Fqx "build-tauri-macos"$\'\\t\'"success"' in release
    assert "build-components (windows-x86_64)" in release
    assert "build-components (macos-aarch64)" in release
    assert "component-release-windows-x86_64" in release
    assert "component-release-macos-aarch64" in release
    desktop_publish = _workflow("desktop-publish.yml")
    assert "release_id:" in desktop_publish
    assert "RELEASE_ID: ${{ inputs.release_id }}" in desktop_publish
    assert "releases/$release_id/assets?per_page=100" in desktop_publish
    assert "releases/$release_id/assets?name=$name" in desktop_publish
    assert "releases/assets/$asset_id" in desktop_publish
    assert (
        ".github/workflows/desktop-build.yml|.github/workflows/release.yml"
        in components
    )
    assert "Desktop artifacts cannot cross product change" in components
    assert 'expected_job="build-desktop / ${expected_job}"' in components


def test_macos_packaging_changes_require_rebuilt_macos_artifacts():
    release = _workflow("release-resume.yml")
    rules = release.split("scripts/pack-tauri/macos_dmg.py)", 1)[1]
    macos_packaging = rules.split(";;", 1)[0]
    assert '[ -z "$MACOS_ARTIFACTS_RUN_ID" ]' in macos_packaging
    assert "macOS packaging changes require replacement macOS artifacts" in (
        macos_packaging
    )


def test_artifact_resume_can_reverify_installation_before_publication():
    text = _workflow("release-resume.yml")
    workflow = yaml.safe_load(text)
    jobs = workflow["jobs"]
    verification = jobs["verify-web"]
    assert "always()" in verification["if"]
    assert "inputs.artifacts_run_id != '' && inputs.reverify_web" in (
        verification["if"]
    )
    assert verification["with"]["verify_pip"] is True
    assert verification["with"]["verify_script_install"] is True
    assert verification["with"]["artifacts_run_id"] == (
        "${{ needs.resolve.outputs.artifacts_run_id }}"
    )
    assert 'if [ "$REVERIFY_WEB" != "true" ]; then\n' in text
    for name in ("publish-desktop", "publish-components"):
        assert "verify-web" in jobs[name]["needs"]
        assert (
            "(!inputs.reverify_web || needs.verify-web.result == 'success')"
            in jobs[name]["if"]
        )
    wheel_verification = yaml.safe_load(_workflow("release-verify.yml"))
    downloads = [
        step["with"]
        for step in wheel_verification["jobs"]["verify-pip"]["steps"]
        if step.get("uses") == "actions/download-artifact@v4"
    ]
    assert {item["name"] for item in downloads} == {
        "qwenpaw-dist",
        "qwenpaw-version",
    }
    for item in downloads:
        assert item["run-id"] == (
            "${{ inputs.artifacts_run_id || github.run_id }}"
        )
        assert item["github-token"] == (
            "${{ inputs.artifacts_run_id && github.token || '' }}"
        )


def test_macos_release_gates_use_the_supported_desktop_runner():
    for name in ("release-verify.yml", "full-tests-nightly.yml"):
        text = _workflow(name)
        assert "macos-latest" not in text
        assert "- os: macos-15" in text
    nightly = _workflow("full-tests-nightly.yml")
    assert 'macos)   [ "$OS" = "macos-15"' in nightly


def test_standalone_macos_build_can_select_supported_arm64_images():
    workflow = yaml.load(
        _workflow("desktop-build.yml"),
        Loader=yaml.BaseLoader,
    )
    for trigger in ("workflow_call", "workflow_dispatch"):
        runner = workflow["on"][trigger]["inputs"]["macos_runner"]
        assert runner["default"] == "macos-15"
    standalone = workflow["on"]["workflow_dispatch"]["inputs"]["macos_runner"]
    assert standalone["type"] == "choice"
    assert standalone["options"] == ["macos-15", "macos-26"]
    assert workflow["jobs"]["build-tauri-macos"]["runs-on"] == (
        "${{ inputs.macos_runner || 'macos-15' }}"
    )


def test_core_artifact_reuse_only_allows_exact_extension_tooling_paths():
    import fnmatch
    import re

    release = _workflow("release-resume.yml")
    rules = release.split('case "$file" in', 1)[1].split("esac", 1)[0]
    first_arm = rules.split(";;", 1)[0].split(")", 1)[0]
    allowed = [
        value.strip() for value in first_arm.replace("\\\n", "").split("|")
    ]
    assert all(not re.search(r"[?*\[]", value) for value in allowed)
    for path in (
        ".github/workflows/apps-release.yml",
        ".github/workflows/plugins-release.yml",
        "scripts/pack/prepare_plugin_versions.py",
        "scripts/verify_update_regressions.py",
        "scripts/fork_backend_suites.json",
        "console/src/plugins/hostSdk/hooks.host.test.ts",
        "console/src/plugins/flowForgeWorkbench.test.tsx",
        "tests/unit/scripts/test_macos_packaging.py",
        "tests/unit/tauri/test_windows_setup_ui.py",
    ):
        assert path in allowed
    for path in (
        "src/qwenpaw/__version__.py",
        "src/qwenpaw/bundled_plugin_policy.py",
        "plugins/bundle/ugsci/plugin.json",
        "plugins/bundle/computer-use/plugin.json",
        "scripts/pack-tauri/build_component_release.py",
        "scripts/pack-tauri/assemble_desktop_layout.py",
        "scripts/pack-tauri/windows_portable_bootstrap.cs",
        "console/src/utils/agentDisplayName.ts",
        "console/src/plugins/hostSdk/hooks.ts",
        "plugins/bundle/flowforge/ui/src/Editor.tsx",
    ):
        assert not any(fnmatch.fnmatchcase(path, rule) for rule in allowed)


def test_optional_frontend_locks_use_public_registry_without_entering_core():
    from urllib.parse import urlparse
    from qwenpaw.bundled_plugin_policy import BUNDLED_PLUGIN_IDS

    # These lockfiles are permitted in the core-artifact resume allowlist
    # only while their plugins remain outside every core distribution.
    for plugin in ("computer-use", "chrome"):
        assert plugin not in BUNDLED_PLUGIN_IDS
        lock = json.loads(
            (
                REPO_ROOT
                / "plugins/bundle"
                / plugin
                / "frontend/package-lock.json"
            ).read_text("utf-8"),
        )
        for package in lock["packages"].values():
            if "resolved" in package:
                assert (
                    urlparse(package["resolved"]).hostname
                    == "registry.npmjs.org"
                )
                assert package["integrity"].startswith("sha512-")


def test_full_unit_gate_builds_actual_computer_use_version_bundle():
    workflow = yaml.safe_load(_workflow("full-tests-nightly.yml"))
    shared = workflow["jobs"]["build-console"]["steps"]
    build_commands = "\n".join(step.get("run", "") for step in shared)
    for frontend in (
        "plugins/bundle/qwenpaw-openui/frontend",
        "plugins/memory/powercontext/frontend",
        "plugins/bundle/computer-use/frontend",
    ):
        assert f"npm --prefix {frontend} ci" in build_commands
        assert f"npm --prefix {frontend} run build" in build_commands
    assert (
        "sha256sum console-build.tar.gz unit-plugin-build.tar.gz"
        in build_commands
    )
    assert "build-console" in workflow["jobs"]["unit-tests"]["needs"]
    steps = workflow["jobs"]["unit-tests"]["steps"]
    build = next(
        index
        for index, step in enumerate(steps)
        if step.get("name") == "Extract verified plugin test runtimes"
    )
    test = next(
        index
        for index, step in enumerate(steps)
        if step.get("name") == "Run unit tests"
    )
    assert build < test
    assert (
        "tar -xzf .test-console/unit-plugin-build.tar.gz"
        in steps[build]["run"]
    )
    assert any(
        "sha256sum --check" in step.get("run", "") for step in steps[:build]
    )


def test_published_release_resume_is_attested_and_has_no_duty_issue() -> None:
    release = _workflow("release-resume.yml")

    assert "allow_published_resume:" in release
    assert (
        "ALLOW_PUBLISHED_RESUME: ${{ inputs.allow_published_resume }}"
        in release
    )
    assert '"$ALLOW_PUBLISHED_RESUME" != "true"' in release
    assert '"$ARTIFACTS_RUN_ID"' in release
    assert "was_draft: ${{ steps.pick.outputs.was_draft }}" in release
    assert 'echo "was_draft=$isDraft"' in release
    assert (
        'release="$(gh api --paginate "repos/$REPO/releases?per_page=100"'
        in release
    )
    assert 'case "$is_draft" in' in release
    assert (
        'gh api --method PATCH "repos/$REPO/releases/$RELEASE_ID" '
        "-F draft=false" in release
    )
    assert "--draft=false --target" not in release
    assert "already published; verifying instead of mutating it" in release
    assert 'test "$target_sha" = "$SHA"' in release
    assert 'test "$published_is_draft" = "false"' in release
    assert 'test "$published_sha" = "$SHA"' in release
    assert "uses: ./.github/workflows/release-duty.yml" not in release
    assert "issues: write" not in release


def test_replacement_desktop_runs_overlay_pair() -> None:
    publish = _workflow("desktop-publish.yml")
    promote = _workflow("desktop-promote.yml")

    assert "UGSci-Desktop-Tauri-*|tauri-updater-meta-*" not in promote
    assert "download_desktop_artifacts.sh" in promote
    assert "--brand ugsci" in promote
    assert "--include-updater-metadata" in promote

    # desktop-publish has separate GitHub Release and OSS jobs.
    assert publish.count("Download replacement Windows updater metadata") == 2
    assert publish.count("Download replacement macOS updater metadata") == 2
    assert (
        publish.count(
            "rm -rf UGSci-Desktop-Tauri-Windows-* tauri-updater-meta-windows",
        )
        == 2
    )
    assert (
        publish.count(
            "rm -rf UGSci-Desktop-Tauri-macOS-* tauri-updater-meta-macos",
        )
        == 2
    )

    assert "Overlay replacement Windows updater metadata" in promote
    assert "Overlay replacement macOS updater metadata" in promote
    assert "cp -a replacement-windows/tauri-updater-meta-windows ." in promote
    assert "cp -a replacement-macos/tauri-updater-meta-macos ." in promote


def test_final_macos_archives_are_reverified_before_publish_and_promote() -> (
    None
):
    publish = _workflow("desktop-publish.yml")
    promote = _workflow("desktop-promote.yml")
    verifier = "scripts/pack-tauri/verify_frozen_plugins.py --archive"

    # Each publish job verifies both the first-install ZIP and updater archive.
    assert publish.count(verifier) == 4
    # Pointer promotion repeats both checks after any replacement overlay.
    assert promote.count(verifier) == 2


def test_windows_native_ui_verification_survives_missing_cdp() -> None:
    action = (
        REPO_ROOT
        / ".github"
        / "actions"
        / "verify-tauri-windows"
        / "action.yml"
    ).read_text(encoding="utf-8")
    launcher = (
        REPO_ROOT / "scripts" / "verify" / "launch_tauri_windows.ps1"
    ).read_text(encoding="utf-8")

    assert "if ($env:CDP_URL) {" in action
    assert '$verifyArgs += @("--cdp-url", $env:CDP_URL)' in action
    assert 'throw "CDP is required' not in launcher
    assert '$cdpUrl = ""' in launcher


def test_component_release_stages_plugins_and_versioned_desktop_layers() -> (
    None
):
    component_release = _workflow("component-release.yml")

    assert "--plugin-roots bundle" in component_release
    assert "--plugin-roots bundle apps" not in component_release
    assert "stage_bundled_plugins.py" in component_release
    assert "stage_desktop_components.py" in component_release
    assert "desktop-components-${{ matrix.target }}" in component_release
    assert "windows_desktop_artifacts_run_id:" in component_release
    assert "macos_desktop_artifacts_run_id:" in component_release
    assert "include_desktop_components:" in component_release
    assert "default: true" in component_release
    assert (
        "run-id: ${{ steps.desktop-source.outputs.run_id }}"
        in component_release
    )
    assert "github-token: ${{ secrets.GITHUB_TOKEN }}" in component_release
    assert ".github/workflows/desktop-build.yml" in component_release
    assert "expected_job='build-tauri-windows'" in component_release
    assert "expected_job='build-tauri-macos'" in component_release

    release = _workflow("release-resume.yml")
    assert (
        "windows_desktop_artifacts_run_id: "
        "${{ format('{0}', github.run_id) }}" in release
    )
    assert (
        "macos_desktop_artifacts_run_id: "
        "${{ format('{0}', github.run_id) }}" in release
    )


def test_mutable_release_metadata_is_promoted_only_after_finalize() -> None:
    release = _workflow("release-resume.yml")
    publish_components = release.index("  publish-components:")
    finalize = release.index("  finalize:")
    promote = release.index("  promote-release-metadata:")
    desktop_promote = release.index("  promote-desktop:")

    assert finalize < promote < desktop_promote
    assert publish_components < finalize < promote
    assert "plugin-promotion-metadata" not in release
    assert "name: component-promotion-metadata" in release
    assert "needs: [resolve, publish-components, finalize]" in release
    pre_finalize = release[:finalize]
    assert "metadata/plugins/.staging" not in pre_finalize
    assert "metadata/.staging" not in pre_finalize
    assert "Phase 2: switch all platform pointers" not in pre_finalize
    promotion_block = release[promote:desktop_promote]
    assert "promotion/plugins" not in promotion_block
    assert "metadata/plugins/index.json" not in promotion_block
    assert "metadata/index.json" not in promotion_block
    assert "metadata/ugsci-core-latest.json" in promotion_block
    assert "metadata/components/stable/$base" in promotion_block
    assert "rollback_metadata" in promotion_block
    assert "needs: [resolve, finalize, promote-release-metadata]" in release
    assert release.count("group: oss-production-metadata") == 1

    for workflow in (
        "component-release.yml",
        "creator-release.yml",
        "desktop-promote.yml",
        "uproject-release.yml",
    ):
        assert "oss-production-metadata" in _workflow(workflow)


def test_windows_b5_migration_uses_signed_visible_bridge() -> None:
    build = _workflow("desktop-build.yml")
    publish = _workflow("desktop-publish.yml")
    promote = _workflow("desktop-promote.yml")

    assert "UGSci-Desktop-migration.exe" in build
    assert "Windows-updater.exe.sig" in build
    assert "Windows-portable.zip" in publish
    assert "Windows-updater.exe" in publish
    assert "Windows-updater.exe" in promote
    assert "Windows-setup.exe" not in promote


def test_desktop_verification_has_production_startup_budget() -> None:
    desktop_build = _workflow("desktop-build.yml")

    assert desktop_build.count("timeout-minutes: 25") >= 2


def test_desktop_build_pins_and_smoke_tests_neqsim() -> None:
    desktop_build = _workflow("desktop-build.yml")
    windows = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_pyinstaller.ps1"
    ).read_text(encoding="utf-8")
    macos = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_pyinstaller.sh"
    ).read_text(encoding="utf-8")

    assert desktop_build.count("QWENPAW_NEQSIM_SHA256") >= 4
    assert "smoke_neqsim.py" in windows
    assert "smoke_neqsim.py" in macos


def test_macos_helper_is_staged_for_legacy_and_layered_layouts() -> None:
    build = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_pyinstaller.sh"
    ).read_text(encoding="utf-8")
    config = (
        REPO_ROOT / "console" / "src-tauri" / "tauri.conf.json"
    ).read_text(encoding="utf-8")

    assert "cargo build --manifest-path" in build
    assert "qwenpaw-computer-use-helper-${RUST_TARGET_TRIPLE}" in build
    assert "tools/computer-use/${VERSION}/qwenpaw-computer-use-helper" in build
    assert '"externalBin": []' in config
    sync = (
        REPO_ROOT / "scripts" / "pack-tauri" / "sync_tauri_version.mjs"
    ).read_text(encoding="utf-8")
    assert 'externalBin: ["binaries/qwenpaw-computer-use-helper"]' in sync


def test_windows_layered_build_allows_discovered_runtime_hashes() -> None:
    windows = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_pyinstaller.ps1"
    ).read_text(encoding="utf-8")
    launcher = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_win_pyinstaller.ps1"
    ).read_text(encoding="utf-8")
    plugin_ui_builder = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_plugin_uis.ps1"
    ).read_text(encoding="utf-8")

    assert '$NODE_RUNTIME_ARGS += @("--sha256"' in windows
    assert '$JRE_ARGS += @("--sha256"' in windows
    assert '$NEQSIM_ARGS += @("--sha256"' in windows
    assert "[SKIP] makensis (not used by layered desktop builds)" in launcher
    assert "Tauri icons are current; skipping regeneration" in launcher
    assert "function Sync-ChangedFiles" in plugin_ui_builder


def test_windows_release_avoids_legacy_long_path_archive_commands() -> None:
    desktop_build = _workflow("desktop-build.yml")
    verifier = (
        REPO_ROOT / "scripts" / "verify" / "launch_tauri_windows.ps1"
    ).read_text(encoding="utf-8")
    launcher = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_win_pyinstaller.ps1"
    ).read_text(encoding="utf-8")

    assert "extract_windows_zip.py" in desktop_build
    assert "Expand-Archive" not in desktop_build
    assert "extract_windows_zip.py" in verifier
    assert "Expand-Archive" not in verifier
    assert "copy_windows_tree.py" in launcher


@pytest.mark.parametrize("legacy_copy", [False, True])
def test_windows_release_validates_current_embedded_native_copier(
    tmp_path,
    legacy_copy,
):
    import shutil

    shell = shutil.which("pwsh") or shutil.which("powershell")
    if not shell:
        pytest.skip("PowerShell is required for Windows package validation")
    steps = yaml.safe_load(_workflow("desktop-build.yml"))["jobs"][
        "build-tauri-windows"
    ]["steps"]
    validation = next(
        step["run"]
        for step in steps
        if "stale or unsafe" in step.get("run", "")
    )
    # YAML removes block indentation, so extract the shipping condition itself.
    check = (
        "if ($installScript"
        + validation.split(
            "if ($installScript",
            1,
        )[1].split(
            "\n}",
            1,
        )[0]
        + "\n}\n"
    )
    builder = (
        REPO_ROOT / "scripts/pack-tauri/create_windows_portable_installer.ps1"
    ).read_text(encoding="utf-8")
    template = builder.split("$installerTemplate = @'\n", 1)[1].split(
        "\n'@\n$installerIoSource",
        1,
    )[0]
    if legacy_copy:
        template = template.replace(
            "[UGSciInstallerIO]::CopyDirectory($payloadRoot, $stagingDir, "
            "$false, $payloadBytes)",
            "Copy-Item -Destination $stagingDir -Recurse -Force",
        )
    installer = tmp_path / "install.ps1"
    installer.write_text(template, encoding="utf-8")
    probe = tmp_path / "validate.ps1"
    probe.write_text(
        "$ErrorActionPreference = 'Stop'\n"
        f"$installScript = Get-Content -LiteralPath '{installer}' -Raw\n"
        + check,
        encoding="utf-8-sig",
    )
    result = subprocess.run(
        [shell, "-NoProfile", "-NonInteractive", "-File", str(probe)],
        check=False,
        capture_output=True,
        text=True,
        errors="replace",
        timeout=30,
    )
    assert (result.returncode != 0) == legacy_copy, result.stderr


def test_macos_updater_metadata_latest_and_prerelease_hardening() -> None:
    publish = _workflow("desktop-publish.yml")
    promote = _workflow("desktop-promote.yml")
    release = _workflow("release-resume.yml")

    # macOS updater archive gets a versioned metadata JSON next to its binary.
    assert "mac-tauri-updater-metadata.json" in publish
    assert "UGSci-Tauri-${VERSION}-macOS.app.tar.gz.json" in publish
    assert "generate_oss_metadata.py" in publish

    # macOS updater archive gets a latest pointer and participates in rollback.
    assert "UGSci-Tauri-latest-macOS.app.tar.gz" in promote
    assert (
        "metadata/apps/desktop/mac-tauri/"
        "UGSci-Tauri-latest-macOS.app.tar.gz.json"
    ) in promote
    assert '"tauri-updater-meta-macos"' in promote
    assert (
        '"mac-tauri-updater-metadata.json"' in promote
        and '"UGSci-Tauri-*-macOS.app.tar.gz"' in promote
    )

    # Promotion downloads only desktop artifacts instead of the whole run.
    assert "- name: Download desktop application artifacts" in promote
    assert "- name: Download desktop updater metadata" in promote
    assert "download_desktop_artifacts.sh" in promote
    assert "--brand ugsci" in promote
    assert "--include-updater-metadata" in promote

    # Prerelease detection covers PEP 440 short tags and the dead no-op block
    # is gone.
    assert "[-.])b[0-9]" in release
    assert "component artifacts are checked below" not in release


def test_workflow_bash_blocks_have_no_dangling_merge_residue() -> None:
    """Guard: no bash keyword may be followed by a bare token on same line.

    Catches incomplete cleanup from workflow edits (e.g. the
    desktop-publish.yml macOS updater step, where a stale ``fi`` line kept
    ``echo``/``exit 0`` and a duplicated upload block after it -- a hard bash
    syntax error that fails the publish step whenever it runs).
    """
    import re

    # Only ``fi`` and ``done`` terminate a compound command; a bare token
    # after them on the same line is a syntax error. Redirects (``<``, ``>``,
    # ``2>``), separators (``;``, ``&``) and comments (``#``) are legitimate.
    # ``then``/``else``/``do`` may legally be followed by a command, so they
    # are intentionally not checked.
    pattern = re.compile(r"^\s*(?:fi|done)\s+[^;#<>&|\s]")
    for workflow in sorted(
        (REPO_ROOT / ".github" / "workflows").glob("*.yml"),
    ):
        lines = workflow.read_text(encoding="utf-8").splitlines()
        in_run_block = False
        run_indent = 0
        for lineno, line in enumerate(lines, 1):
            run_match = re.match(r"^(\s+)run:\s*\|", line)
            if run_match:
                in_run_block = True
                run_indent = len(run_match.group(1))
                continue
            if in_run_block:
                stripped = line.strip()
                if stripped:
                    indent = len(line) - len(line.lstrip())
                    if indent <= run_indent:
                        in_run_block = False
                        continue
                    assert not pattern.match(line), (
                        f"{workflow.name}:{lineno} has a bash keyword "
                        f"followed by a same-line token (merge residue): "
                        f"{line!r}"
                    )


def test_macos_updater_step_has_single_upload_block() -> None:
    """Guard: the macOS updater step must not contain a duplicated upload."""
    publish = _workflow("desktop-publish.yml")
    assert publish.count("Immutable macOS updater artifact differs") == 1
    assert publish.count("Remote macOS updater verification failed") == 1
    assert (
        publish.count(
            'echo "Verified existing immutable macOS updater artifact"',
        )
        == 1
    )
    assert (
        'ossutil cp mac-tauri-updater-metadata.json "$metadata_uri"' in publish
    )
    assert (
        'ossutil cp mac-tauri-updater-metadata.json "$metadata_tmp"'
        not in publish
    )


def test_unpublished_desktop_cleanup_is_draft_guarded_and_exact() -> None:
    """An abandoned build purge must never broaden into release cleanup."""
    cleanup = _workflow("oss-cleanup.yml")
    assert "mode=purge-unpublished" in cleanup
    assert "contents: write" in cleanup
    assert 'gh release view "$tag" --repo "$REPOSITORY"' in cleanup
    assert 'if [ "$is_draft" != "true" ]' in cleanup
    assert (
        "latest"
        not in cleanup.split(
            "- name: Purge abandoned unpublished desktop version",
            1,
        )[1].split("- name: List remaining desktop files", 1)[0]
    )
    for suffix in (
        "Windows-portable.zip",
        "Windows-updater.exe",
        "macOS.zip",
        "macOS.app.tar.gz",
    ):
        assert f"UGSci-Tauri-${{VERSION}}-{suffix}" in cleanup
    assert cleanup.count('ossutil rm "$uri" --force') == 1


def test_python_runtime_release_pin_is_consistent_across_builds() -> None:
    """Guard: the python-build-standalone pin must stay in sync everywhere.

    The staged runtime is pinned in three places: the script default
    (``stage_python_runtime.py``) and the Windows/macOS job env in
    ``desktop-build.yml``. Upgrading one without the others silently desyncs
    the bundled runtime from the frozen interpreter, or points the hash
    check at the wrong archive.
    """
    import re

    script = (
        REPO_ROOT / "scripts" / "pack-tauri" / "stage_python_runtime.py"
    ).read_text(encoding="utf-8")
    build = _workflow("desktop-build.yml")

    default_match = re.search(
        r'^DEFAULT_RELEASE\s*=\s*"(\d{8})"$',
        script,
        re.MULTILINE,
    )
    assert (
        default_match
    ), "DEFAULT_RELEASE pin not found in stage_python_runtime.py"
    default_release = default_match.group(1)

    workflow_pins = re.findall(
        r'QWENPAW_PYTHON_BUILD_STANDALONE_RELEASE:\s*"(\d{8})"',
        build,
    )
    assert len(workflow_pins) == 2, (
        "expected exactly 2 runtime release pins (Windows + macOS) in "
        f"desktop-build.yml, found {len(workflow_pins)}"
    )
    assert set(workflow_pins) == {default_release}, (
        f"workflow runtime pins {workflow_pins} diverge from the script "
        f"default {default_release!r}"
    )

    raw_hashes = re.findall(
        r'QWENPAW_PYTHON_RUNTIME_SHA256:\s*"([^"]+)"',
        build,
    )
    assert len(raw_hashes) == 2, (
        "both desktop jobs must pin a runtime SHA256, found "
        f"{len(raw_hashes)}"
    )
    for digest in raw_hashes:
        assert re.fullmatch(r"[0-9a-f]{64}", digest), (
            "runtime SHA256 must be a 64-char lowercase hex digest, "
            f"got {digest!r}"
        )
    assert raw_hashes[0] != raw_hashes[1], (
        "Windows and macOS runtime hashes must differ (different archives); "
        "an identical value means one job pins the wrong platform's hash"
    )


def test_pointer_post_check_is_polarity_aware() -> None:
    """Claim 3: post-promotion readback must not false-alarm on newer wins.

    A concurrent NEWER run legitimately winning the race must be accepted
    (warning), only an OLDER run clobbering our pointer is an error. The
    check therefore runs check_component_pointer_promotion with roles
    swapped (local=live, remote=ours) as the acceptance test.
    """
    release = _workflow("component-release.yml")
    assert 'cmp -s "$pointer" "$verify_file"' in release
    assert '--local "$verify_file" --remote "$pointer"' in release, (
        "post-promotion readback must accept a strictly-newer live pointer "
        "via the role-swapped monotonic check instead of cmp-only equality"
    )
    assert "newer concurrent promotion superseded" in release


def test_creator_release_uses_parameterized_oss_bucket() -> None:
    creator = _workflow("creator-release.yml")
    assert "OSS_BUCKET: ${{ vars.OSS_BUCKET || 'ugsci-download' }}" in creator
    assert "oss://${OSS_BUCKET}/" in creator
    assert "oss://ugsci-download/" not in creator


def test_uproject_release_uses_parameterized_oss_bucket() -> None:
    workflow = _workflow("uproject-release.yml")
    assert "OSS_BUCKET: ${{ vars.OSS_BUCKET || 'ugsci-download' }}" in workflow
    assert "oss://${OSS_BUCKET}/" in workflow
    assert "oss://ugsci-download/" not in workflow
    assert '--only "${PLUGIN_ID}"' in workflow
    assert "ui/index.js" in workflow
    assert "ui/dist/index.js" not in workflow
    assert "setup-node" not in workflow
    assert "npm --prefix" not in workflow


def _pack_upload_fixture(tmp_path):
    spec = spec_from_file_location(
        "release_plugin_packer",
        REPO_ROOT / "scripts/pack/generate_plugin_metadata.py",
    )
    assert spec and spec.loader
    packer = module_from_spec(spec)
    spec.loader.exec_module(packer)
    root = tmp_path / "dist/plugins"
    hub = tmp_path / "hub-source"
    hub.mkdir()
    manifest = {
        "id": "release-hub",
        "version": "1.0.0",
        "entry": {"backend": "plugin.py"},
    }
    (hub / "plugin.json").write_text(json.dumps(manifest), "utf-8")
    (hub / "plugin.py").write_text("VALUE = 1\n", "utf-8")
    files = {}
    for kind, source in (
        ("channel", REPO_ROOT / "plugins/channel/azure_bot"),
        ("hub", hub),
    ):
        manifest = json.loads((source / "plugin.json").read_text("utf-8"))
        identifier, version = manifest["id"], manifest["version"]
        relative = f"{kind}/{identifier}/{identifier}-{version}.zip"
        archive = root / relative
        # Exercise the same archive and metadata builders as release packing.
        # pylint: disable=protected-access
        packer._zip_plugin(source, archive, manifest)
        row = packer._build_metadata(
            manifest,
            file_id=archive.stem,
            plugin_id=identifier,
            version=version,
            kind=kind,
            zip_path=archive,
            cdn_path=f"/files/plugins/{relative}",
        )
        files[row["id"]] = row
    (root / "index.json").write_text(json.dumps({"files": files}), "utf-8")
    return root, files


def _upload_module():
    spec = spec_from_file_location(
        "release_plugin_upload",
        REPO_ROOT / "scripts/pack/upload_plugin_artifacts.py",
    )
    assert spec and spec.loader
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _mock_oss_transport(monkeypatch, uploader, remote):
    """Only replace OSS transport; use actual ZIP bytes and file comparison."""
    uploads = []

    def oss(arguments):
        command, source, *rest = arguments
        if command == "stat":
            exists = source in remote
            return subprocess.CompletedProcess(
                arguments,
                0 if exists else 1,
                "",
                "" if exists else "NoSuchKey",
            )
        assert command == "cp"
        destination = rest[0]
        if source.startswith("oss://"):
            Path(destination).write_bytes(remote[source])
        else:
            assert "x-oss-forbid-overwrite:true#" in rest[-1]
            assert "--force" not in arguments
            assert destination not in remote
            remote[destination] = Path(source).read_bytes()
            uploads.append(destination)
        return subprocess.CompletedProcess(arguments, 0, "", "")

    monkeypatch.setattr(uploader, "_oss", oss)
    return uploads


@pytest.mark.parametrize(
    "workflow_name,job",
    [
        ("plugins-release.yml", "upload-oss"),
    ],
)
def test_plugin_publish_jobs_upload_indexed_azure_and_hub_artifacts(
    tmp_path,
    monkeypatch,
    workflow_name,
    job,
):
    steps = yaml.safe_load(_workflow(workflow_name))["jobs"][job]["steps"]
    step = next(
        row
        for row in steps
        if row.get("name") == "Sync plugin zips to OSS (long-cache, immutable)"
    )
    assert "python scripts/pack/upload_plugin_artifacts.py" in step["run"]
    assert '--root dist/plugins --bucket "$OSS_BUCKET"' in step["run"]
    assert not step.get("continue-on-error", False)
    root, files = _pack_upload_fixture(tmp_path)
    uploader = _upload_module()
    remote = {}
    uploads = _mock_oss_transport(monkeypatch, uploader, remote)
    uploader.upload_artifacts(root, "release-test")
    expected = {f"oss://release-test{row['url']}" for row in files.values()}
    assert set(uploads) == set(remote) == expected
    assert any("/channel/azure-bot/" in uri for uri in remote)
    assert any("/hub/release-hub/" in uri for uri in remote)
    for row in files.values():
        relative = row["url"].removeprefix("/files/plugins/")
        assert (
            remote[f"oss://release-test{row['url']}"]
            == (root / relative).read_bytes()
        )
    uploads.clear()
    uploader.upload_artifacts(root, "release-test")
    assert not uploads


@pytest.mark.parametrize("preflight_only", [False, True])
def test_plugin_upload_conflict_blocks_every_new_object(
    tmp_path,
    monkeypatch,
    preflight_only,
):
    root, files = _pack_upload_fixture(tmp_path)
    uploader = _upload_module()
    hub = next(row for row in files.values() if row["platform"] == "hub")
    remote = {
        f"oss://release-test{hub['url']}": b"published different content",
    }
    uploads = _mock_oss_transport(monkeypatch, uploader, remote)
    with pytest.raises(ValueError, match="without a version bump"):
        uploader.upload_artifacts(
            root,
            "release-test",
            preflight_only=preflight_only,
        )
    assert not uploads


def test_independent_release_versions_advance_only_changed_payloads(
    tmp_path,
    monkeypatch,
):
    """Reuse unchanged ZIPs without altering compatibility bounds."""
    import io

    root, files = _pack_upload_fixture(tmp_path)
    repo = tmp_path / "repo"
    for row in files.values():
        archive = root / row["url"].removeprefix("/files/plugins/")
        with zipfile.ZipFile(archive) as package:
            name = next(
                name
                for name in package.namelist()
                if name.endswith("/plugin.json")
            )
            payload = package.read(name)
        for directory in (
            repo / "plugins" / row["platform"] / row["plugin_id"],
            repo / "src/qwenpaw/plugins_bundle" / row["plugin_id"],
        ):
            directory.mkdir(parents=True)
            (directory / "plugin.json").write_bytes(payload)
    uploader = _upload_module()
    remote = {
        f"oss://release-test{row['url']}": (
            root / row["url"].removeprefix("/files/plugins/")
        ).read_bytes()
        for row in files.values()
    }
    uploads = _mock_oss_transport(monkeypatch, uploader, remote)
    monkeypatch.syspath_prepend(str(REPO_ROOT / "scripts/pack"))
    spec = spec_from_file_location(
        "version_reconciliation_test",
        REPO_ROOT / "scripts/pack/prepare_plugin_versions.py",
    )
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    monkeypatch.setattr(
        module,
        "_oss",
        uploader._oss,  # pylint: disable=protected-access
    )
    index = {"files": files, "_bucket": "release-test"}
    assert module.reconcile(repo, root, index) == []
    row = next(
        row for row in files.values() if row["plugin_id"] == "release-hub"
    )
    uri = f"oss://release-test{row['url']}"
    older = io.BytesIO()
    with (
        zipfile.ZipFile(io.BytesIO(remote[uri])) as original,
        zipfile.ZipFile(older, "w") as archive,
    ):
        for name in original.namelist():
            archive.writestr(
                name,
                (
                    b"VALUE = 0\n"
                    if name.endswith("plugin.py")
                    else original.read(name)
                ),
            )
    remote[uri] = older.getvalue()
    manifest = repo / "plugins/hub/release-hub/plugin.json"
    before = json.loads(manifest.read_text("utf-8"))
    changed = module.reconcile(repo, root, index)
    assert len(changed) == 2
    after = json.loads(manifest.read_text("utf-8"))
    assert after == {**before, "version": "1.0.1"}
    assert (
        json.loads(
            (
                repo / "src/qwenpaw/plugins_bundle/release-hub/plugin.json"
            ).read_text("utf-8"),
        )
        == after
    )
    assert not uploads


@pytest.mark.parametrize("damage", ["missing", "digest", "unindexed"])
def test_plugin_upload_rejects_incomplete_local_artifacts(
    tmp_path,
    monkeypatch,
    damage,
):
    root, files = _pack_upload_fixture(tmp_path)
    row = next(iter(files.values()))
    archive = root / row["url"].removeprefix("/files/plugins/")
    if damage == "missing":
        archive.unlink()
    elif damage == "digest":
        archive.write_bytes(b"damaged ZIP")
    else:
        (root / "unindexed.zip").write_bytes(b"unindexed ZIP")
    uploader = _upload_module()

    def unexpected_transport(_arguments):
        raise AssertionError("Local validation must precede OSS access")

    monkeypatch.setattr(uploader, "_oss", unexpected_transport)
    with pytest.raises(ValueError, match="artifact|inventory"):
        uploader.upload_artifacts(root, "release-test")


@pytest.mark.parametrize("failure", ["denied", "readback"])
def test_plugin_upload_transport_failures_do_not_pass(
    tmp_path,
    monkeypatch,
    failure,
):
    root, _files = _pack_upload_fixture(tmp_path)
    uploader = _upload_module()
    remote = {}
    uploads = _mock_oss_transport(monkeypatch, uploader, remote)
    transport = getattr(uploader, "_oss")

    def fail_transport(arguments):
        if failure == "denied" and arguments[0] == "stat":
            return subprocess.CompletedProcess(
                arguments,
                1,
                "",
                "StatusCode: 403 AccessDenied",
            )
        result = transport(arguments)
        if (
            failure == "readback"
            and arguments[0] == "cp"
            and arguments[1].startswith("oss://")
        ):
            Path(arguments[2]).write_bytes(b"corrupted remote object")
        return result

    monkeypatch.setattr(uploader, "_oss", fail_transport)
    with pytest.raises(
        (RuntimeError, ValueError),
        match="403|verification failed",
    ):
        uploader.upload_artifacts(root, "release-test")
    if failure == "denied":
        assert not uploads


@pytest.mark.parametrize("existing", [False, True])
def test_plugin_preflight_reads_actual_objects_without_uploading(
    tmp_path,
    monkeypatch,
    existing,
):
    root, files = _pack_upload_fixture(tmp_path)
    uploader = _upload_module()
    remote = {}
    if existing:
        remote = {
            f"oss://release-test{row['url']}": (
                root / row["url"].removeprefix("/files/plugins/")
            ).read_bytes()
            for row in files.values()
        }
    before = dict(remote)
    uploads = _mock_oss_transport(monkeypatch, uploader, remote)
    uploader.upload_artifacts(root, "release-test", preflight_only=True)
    assert remote == before
    assert not uploads


def test_release_expensive_jobs_require_immutable_plugin_preflight():
    """Core builds are independent; market uploads still fail closed."""
    jobs = yaml.safe_load(_workflow("release-resume.yml"))["jobs"]
    assert "build-plugins" not in jobs and "publish-plugins" not in jobs
    for name in ("build-wheel", "build-desktop", "full-test-gate"):
        assert jobs[name]["needs"] == ["resolve"]
    steps = yaml.safe_load(_workflow("plugins-release.yml"))["jobs"][
        "upload-oss"
    ]["steps"]
    names = [step.get("name") for step in steps]
    preflight = next(
        step
        for step in steps
        if step.get("name") == "Preflight immutable plugin versions"
    )
    assert "--preflight" in preflight["run"]
    assert "--reject-apps" in preflight["run"]
    assert not preflight.get("continue-on-error", False)
    assert names.index("Pack plugins and build index") < names.index(
        preflight["name"],
    )
    assert names.index(preflight["name"]) < names.index(
        "Sync plugin zips to OSS (long-cache, immutable)",
    )


def test_console_checkout_preserves_formatter_line_endings(tmp_path):
    """Exercise real Git checkout with Windows automatic conversion."""
    (tmp_path / ".gitattributes").write_bytes(
        (REPO_ROOT / ".gitattributes").read_bytes(),
    )
    console = tmp_path / "console"
    console.mkdir()
    text = b"first line\nsecond line\n"
    extensions = (
        "ts",
        "tsx",
        "js",
        "mjs",
        "cjs",
        "json",
        "css",
        "less",
        "scss",
        "html",
        "md",
        "mdx",
        "yaml",
        "yml",
        "svg",
    )
    text_files = [console / f"format.{extension}" for extension in extensions]
    binary = console / "sample.png"
    batch = console / "verify.bat"
    binary_bytes = b"\x89PNG\x00\r\n\x00payload\n"
    for path in text_files:
        path.write_bytes(text)
    binary.write_bytes(binary_bytes)
    batch.write_bytes(b"@echo off\necho verify\n")
    for arguments in (
        ["init", "--quiet"],
        ["config", "core.autocrlf", "true"],
        ["add", ".gitattributes", "console"],
    ):
        subprocess.run(
            ["git", *arguments],
            cwd=tmp_path,
            check=True,
            capture_output=True,
        )
    for path in [*text_files, binary, batch]:
        path.unlink()
    subprocess.run(
        ["git", "checkout-index", "--all"],
        cwd=tmp_path,
        check=True,
        capture_output=True,
    )
    for path in text_files:
        assert path.read_bytes() == text, path.name
    assert binary.read_bytes() == binary_bytes
    assert batch.read_bytes() == b"@echo off\r\necho verify\r\n"


@pytest.mark.parametrize("kind", ["apps", "hub"])
def test_main_plugin_publisher_rejects_actual_application_archives(
    tmp_path,
    monkeypatch,
    kind,
):
    root, files = _pack_upload_fixture(tmp_path)
    row = next(row for row in files.values() if row["platform"] == "hub")
    original = root / row["url"].removeprefix("/files/plugins/")
    with zipfile.ZipFile(original) as archive:
        members = {name: archive.read(name) for name in archive.namelist()}
    manifest_name = f"{row['plugin_id']}/plugin.json"
    manifest = json.loads(members[manifest_name])
    manifest["type"] = "app"
    members[manifest_name] = json.dumps(manifest).encode()
    destination = root / kind / row["plugin_id"] / row["filename"]
    destination.parent.mkdir(parents=True, exist_ok=True)
    original.unlink()
    with zipfile.ZipFile(destination, "w") as archive:
        for name, content in members.items():
            archive.writestr(name, content)
    row.update(
        url=f"/files/plugins/{kind}/{row['plugin_id']}/{row['filename']}",
        sha256=hashlib.sha256(destination.read_bytes()).hexdigest(),
        size_bytes=destination.stat().st_size,
    )
    (root / "index.json").write_text(json.dumps({"files": files}), "utf-8")
    uploader = _upload_module()

    def forbidden_transport(_arguments):
        raise AssertionError("Application rejection must precede OSS access")

    monkeypatch.setattr(uploader, "_oss", forbidden_transport)
    with pytest.raises(ValueError, match="independent release"):
        uploader.upload_artifacts(root, "release-test", reject_apps=True)
    assert len(uploader.artifact_plan(root)) == 2


@pytest.mark.parametrize(
    "workflow_name,job",
    [
        ("plugins-release.yml", "upload-oss"),
    ],
)
def test_main_release_workflows_exclude_every_application(workflow_name, job):
    steps = yaml.safe_load(_workflow(workflow_name))["jobs"][job]["steps"]
    pack = next(
        step
        for step in steps
        if step.get("name") == "Pack plugins and build index"
    )
    assert "--exclude-apps" in pack["run"]
    assert all(
        step.get("name") != "Build app plugin frontends" for step in steps
    )
    for step in steps:
        command = step.get("run", "")
        if "python scripts/pack/upload_plugin_artifacts.py" in command:
            assert "--reject-apps" in command


@pytest.mark.parametrize(
    "name",
    [
        "creator",
        "qwenpaw-data",
        "uproject",
        "document-forms",
        "storage-capacity",
        "wellbore-pressure",
        "apps",
    ],
)
def test_application_releases_prepare_versions_without_force_overwrites(name):
    workflow = yaml.safe_load(_workflow(f"{name}-release.yml"))
    assert workflow["permissions"]["contents"] == "write"
    assert workflow["concurrency"]["group"] == "oss-production-metadata"
    assert "check-version" not in workflow["jobs"]
    steps = next(iter(workflow["jobs"].values()))["steps"]
    prepare = next(
        step
        for step in steps
        if step.get("name") == "Prepare independent application version"
    )
    for argument in ("--sdk", "--commit", "--branch", "--repack"):
        assert argument in prepare["run"]
    assert not prepare.get("continue-on-error", False)
    assert "github.event.inputs.force" not in _workflow(f"{name}-release.yml")


def test_every_application_has_an_independent_release_entry():
    """Removing apps from core must never orphan an app's release path."""
    workflow = yaml.safe_load(_workflow("apps-release.yml"))
    events = workflow.get("on", workflow.get(True))
    generic = set(events["workflow_dispatch"]["inputs"]["app_id"]["options"])
    dedicated = {
        "qwenpaw-creator": "creator",
        "qwenpaw-data": "qwenpaw-data",
        "uproject": "uproject",
        "document-forms": "document-forms",
        "storage-capacity": "storage-capacity",
        "wellbore-pressure": "wellbore-pressure",
    }
    actual = {
        json.loads(path.read_text("utf-8"))["id"]
        for path in (REPO_ROOT / "plugins/apps").glob("*/plugin.json")
    }
    assert actual == generic | dedicated.keys()
    assert not generic.intersection(dedicated)
    for name in dedicated.values():
        assert "Prepare independent application version" in _workflow(
            f"{name}-release.yml",
        )


@pytest.mark.parametrize(
    "current,releases,channel,expected,tag",
    [
        ("2.3.0b5", ["v2.3.0-beta.6"], "beta", "2.3.0b7", "v2.3.0-beta.7"),
        ("2.3.0b5", [], "stable", "2.3.0", "v2.3.0"),
        ("2.3.0", ["bad-tag"], "beta", "2.3.1b1", "v2.3.1-beta.1"),
        ("2.3.0", [], "stable", "2.3.1", "v2.3.1"),
    ],
)
def test_core_release_allocates_monotonic_independent_versions(
    current,
    releases,
    channel,
    expected,
    tag,
):
    spec = spec_from_file_location(
        "core_version_test",
        REPO_ROOT / "scripts/pack/prepare_core_release.py",
    )
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    version = module.next_version(current, releases, channel)
    assert version == expected
    assert module.release_tag(version) == tag
    # GitHub JSON is UTF-8 even on a Windows host using a GBK locale.
    import sys

    assert (
        module.command(
            sys.executable,
            "-c",
            "import sys; "
            "sys.stdout.buffer.write(bytes([229,143,145,229,184,131]))",
        )
        == "发布"
    )


def test_application_version_preparation_commits_and_repacks_real_artifact(
    tmp_path,
    monkeypatch,
):
    import sys

    repo = tmp_path / "repo"
    source = repo / "plugins/apps/release-app"
    source.mkdir(parents=True)
    manifest = {
        "id": "release-app",
        "version": "1.0.0",
        "type": "app",
        "entry": {"backend": "plugin.py"},
        "qwenpaw_version": ">=2.2.0,<3.0.0",
    }
    (source / "plugin.json").write_text(json.dumps(manifest), "utf-8")
    (source / "plugin.py").write_bytes(b"VALUE = 2\n")
    frontend = source / "ui"
    frontend.mkdir()
    (frontend / "index.js").write_text('version="1.0.0"', "utf-8")
    (frontend / "package.json").write_text(
        json.dumps({"scripts": {"build": "node build.cjs"}}),
        "utf-8",
    )
    (frontend / "build.cjs").write_text(
        "const fs=require('node:fs'); const path=require('node:path');\n"
        "const manifest=JSON.parse(fs.readFileSync("
        "path.join(__dirname,'../plugin.json'),'utf8'));\n"
        "fs.writeFileSync(path.join(__dirname,'index.js'),"
        "'version='+JSON.stringify(manifest.version));\n",
        "utf-8",
    )
    (repo / ".gitignore").write_text("dist/\n", "utf-8")
    remote_git = tmp_path / "remote.git"
    for arguments in (
        ["init", "--bare", str(remote_git)],
        ["init", "-b", "main"],
        ["config", "user.name", "Release test"],
        ["config", "user.email", "test@example.com"],
        ["add", "."],
        ["commit", "-m", "initial"],
        ["remote", "add", "origin", str(remote_git)],
        ["push", "origin", "main"],
    ):
        subprocess.run(
            ["git", *arguments],
            cwd=repo,
            check=True,
            capture_output=True,
        )
    dist = repo / "dist/app"
    subprocess.run(
        [
            sys.executable,
            str(REPO_ROOT / "scripts/pack/generate_plugin_metadata.py"),
            "--plugins-root",
            str(repo / "plugins"),
            "--dist",
            str(dist),
            "--metadata-out",
            str(dist / "index.json"),
            "--cdn-prefix",
            "/files/plugins",
            "--only",
            "release-app",
        ],
        check=True,
        capture_output=True,
    )
    index = json.loads((dist / "index.json").read_text("utf-8"))
    row = next(iter(index["files"].values()))
    remote = {
        "oss://release-test/metadata/plugins/index.json": json.dumps(
            index,
        ).encode(),
        f"oss://release-test{row['url']}": b"previous immutable package",
    }
    uploader = _upload_module()
    uploads = _mock_oss_transport(monkeypatch, uploader, remote)
    monkeypatch.syspath_prepend(str(REPO_ROOT / "scripts/pack"))
    spec = spec_from_file_location(
        "app_version_cli_test",
        REPO_ROOT / "scripts/pack/prepare_plugin_versions.py",
    )
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    monkeypatch.setattr(
        module,
        "_oss",
        uploader._oss,  # pylint: disable=protected-access
    )
    monkeypatch.setattr(
        sys,
        "argv",
        [
            "prepare_plugin_versions.py",
            "--repo",
            str(repo),
            "--dist",
            str(dist),
            "--bucket",
            "release-test",
            "--commit",
            "--branch",
            "main",
            "--repack",
        ],
    )
    module.main()
    assert not uploads
    assert json.loads((source / "plugin.json").read_text("utf-8")) == {
        **manifest,
        "version": "1.0.1",
    }
    new_index = json.loads((dist / "index.json").read_text("utf-8"))
    new_row = next(iter(new_index["files"].values()))
    assert new_row["version"] == "1.0.1"
    archives = list(dist.rglob("*.zip"))
    assert len(archives) == 1
    with zipfile.ZipFile(archives[0]) as package:
        assert package.read("release-app/plugin.py") == b"VALUE = 2\n"
        assert package.read("release-app/ui/index.js") == b'version="1.0.1"'
        assert json.loads(package.read("release-app/plugin.json")) == {
            **manifest,
            "version": "1.0.1",
        }
    published_manifest = subprocess.check_output(
        [
            "git",
            "--git-dir",
            str(remote_git),
            "show",
            "main:plugins/apps/release-app/plugin.json",
        ],
    )
    assert json.loads(published_manifest)["version"] == "1.0.1"
