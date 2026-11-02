# -*- coding: utf-8 -*-
"""Regression guards for safe release artifact resume and replacement."""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]


def _workflow(name: str) -> str:
    return (REPO_ROOT / ".github" / "workflows" / name).read_text(
        encoding="utf-8",
    )


def _condition_value(node, bindings):
    """Interpret only the boolean syntax used by the actual finalize gate."""
    import ast

    if isinstance(node, ast.Expression):
        return _condition_value(node.body, bindings)
    if isinstance(node, ast.Constant):
        assert isinstance(node.value, (bool, str))
        return node.value
    if isinstance(node, ast.Name):
        return bindings[node.id]
    if isinstance(node, ast.UnaryOp):
        assert isinstance(node.op, ast.Not)
        return not _condition_value(node.operand, bindings)
    if isinstance(node, ast.BoolOp):
        assert isinstance(node.op, (ast.And, ast.Or))
        values = [_condition_value(value, bindings) for value in node.values]
        return all(values) if isinstance(node.op, ast.And) else any(values)
    assert isinstance(node, ast.Compare)
    assert len(node.ops) == len(node.comparators) == 1
    assert isinstance(node.ops[0], ast.Eq)
    return _condition_value(node.left, bindings) == _condition_value(
        node.comparators[0],
        bindings,
    )


def test_finalize_requires_every_publish_gate_to_succeed() -> None:
    import ast
    import itertools
    import re
    import yaml

    job = yaml.safe_load(_workflow("release-resume.yml"))["jobs"]["finalize"]
    dependencies = (
        "resolve",
        "publish-desktop",
        "publish-plugins",
        "publish-components",
        "full-test-gate",
    )
    assert set(job["needs"]) == set(dependencies)
    expression = job["if"].removeprefix("${{").removesuffix("}}").strip()
    for index, dependency in enumerate(dependencies):
        expression = expression.replace(
            f"needs.{dependency}.result",
            f"result_{index}",
        )
    for original, replacement in (
        ("inputs.dry_run", "dry_run"),
        ("always()", "always_status"),
        ("failure()", "failure_status"),
        ("cancelled()", "cancelled_status"),
    ):
        expression = expression.replace(original, replacement)
    expression = expression.replace("&&", " and ").replace("||", " or ")
    expression = re.sub(r"!(?!=)", "not ", expression)
    condition = ast.parse(expression.strip(), mode="eval")
    # A cancelled reusable build can leave every direct publisher skipped.
    # Evaluate the real gate for all 2,048 result/dry-run combinations.
    for states in itertools.product(
        ("success", "skipped", "cancelled", "failure"),
        repeat=len(dependencies),
    ):
        for dry_run in (False, True):
            bindings = {
                **{f"result_{i}": state for i, state in enumerate(states)},
                "dry_run": dry_run,
                "always_status": True,
                "failure_status": "failure" in states,
                "cancelled_status": "cancelled" in states,
            }
            expected = not dry_run and all(s == "success" for s in states)
            assert _condition_value(condition, bindings) is expected, (
                states,
                dry_run,
                job["if"],
            )


def test_clean_release_and_frontend_checks_build_openui_runtime() -> None:
    for name, gate in (
        ("release-resume.yml", "Pack plugins and build index"),
        ("plugins-build.yml", "Pack plugins and build index"),
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
        ("release.yml", "Build package"),
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


def test_plugin_pack_job_installs_channel_contract_dependencies():
    import yaml

    for name in ("release-resume.yml", "plugins-build.yml"):
        job = yaml.safe_load(_workflow(name))["jobs"]["build-plugins"]
        steps = job["steps"]
        pack = next(
            index
            for index, step in enumerate(steps)
            if "scripts/pack/generate_plugin_metadata.py"
            in step.get("run", "")
        )
        install = next(
            index
            for index, step in enumerate(steps)
            if "python -m pip install -r "
            "scripts/pack/channel-contract-requirements.txt"
            in step.get("run", "")
        )
        assert install < pack
        assert "if" not in steps[install]
        assert not steps[install].get("continue-on-error", False)
        assert not job.get("continue-on-error", False)


def test_reusable_plugin_build_matches_release_artifact_scope() -> None:
    for name in ("release-resume.yml", "plugins-build.yml"):
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
        for plugin in (
            "qwenpaw-creator",
            "uproject",
            "datapaw",
            "qwenpaw-data",
        ):
            assert f"--exclude {plugin}" in workflow[pack:]


def test_release_builds_run_center_and_docker_runtime_dependencies() -> None:
    release = _workflow("release.yml")
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
        assert workflow.index("Build Run Center frontend") < workflow.index(
            "Pack plugins and build index",
        )
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
    assert "[-.](a|b|rc|dev)" in release


def test_resumable_release_publish_waits_for_full_test_gate() -> None:
    release = _workflow("release-resume.yml")
    for job, following in (
        ("publish-desktop", "publish-plugins"),
        ("publish-plugins", "publish-components"),
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
        "release.yml",
        "release-resume.yml",
        "publish-pypi.yml",
        "fork-verify.yml",
        "release-verify.yml",
    ):
        text = _workflow(workflow)
        assert text.index("Build bundled Run Center frontend") < text.index(
            "python -m build"
            if workflow != "release-verify.yml"
            else "Run install script",
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
    assert 'validate_artifact_reuse_diff "$plugins_sha" "$sha"' in release
    assert 'validate_artifact_reuse_diff "$replacement_sha" "$sha"' in release
    assert "grep -qx 'tauri-updater-meta-windows'" in release
    assert "grep -qx 'tauri-updater-meta-macos'" in release
    assert "Replacement artifact run IDs require artifacts_run_id" in release
    assert (
        "Desktop layout changes require Windows, macOS, and component "
        "replacement artifacts" in release
    )
    assert "scripts/pack-tauri/assemble_desktop_layout.py" in release
    assert "scripts/pack-tauri/stage_node_runtime.py" in release
    assert "tests/unit/tauri/test_stage_node_runtime.py" in release
    assert release.count('[ -z "$WINDOWS_ARTIFACTS_RUN_ID" ]') >= 1
    assert release.count('[ -z "$MACOS_ARTIFACTS_RUN_ID" ]') >= 1
    assert release.count('[ -z "$COMPONENTS_ARTIFACTS_RUN_ID" ]') >= 1
    assert release.count(".github/workflows/desktop-build.yml") >= 2
    assert ".github/workflows/plugins-build.yml" in release
    assert ".github/workflows/component-release.yml" in release
    assert 'grep -Fqx "build-tauri-windows"$\'\\t\'"success"' in release
    assert 'grep -Fqx "build-tauri-macos"$\'\\t\'"success"' in release
    assert 'grep -Fqx "build-plugins"$\'\\t\'"success"' in release
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

    assert "--plugin-roots bundle\n" in component_release
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
    publish_plugins = release.index("  publish-plugins:")
    publish_components = release.index("  publish-components:")
    finalize = release.index("  finalize:")
    promote = release.index("  promote-release-metadata:")
    desktop_promote = release.index("  promote-desktop:")

    assert publish_plugins < finalize < promote < desktop_promote
    assert publish_components < finalize < promote
    assert "name: plugin-promotion-metadata" in release
    assert "name: component-promotion-metadata" in release
    assert (
        "needs: [resolve, publish-plugins, publish-components, finalize]"
        in release
    )
    pre_finalize = release[:finalize]
    assert "metadata/plugins/.staging" not in pre_finalize
    assert "metadata/.staging" not in pre_finalize
    assert "Phase 2: switch all platform pointers" not in pre_finalize
    promotion_block = release[promote:desktop_promote]
    assert (
        "find promotion/plugins -type f -name 'index.json'" in promotion_block
    )
    assert "metadata/plugins/index.json" in promotion_block
    assert "metadata/index.json" in promotion_block
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


def test_macos_runner_preserves_native_deployment_and_payload_gates() -> None:
    import yaml

    jobs = yaml.safe_load(_workflow("desktop-build.yml"))["jobs"]
    job = jobs["build-tauri-macos"]
    assert job["runs-on"] == "macos-26"
    assert job["env"]["MACOSX_DEPLOYMENT_TARGET"] == "14.0"
    steps = job["steps"]
    architecture = next(
        step
        for step in steps
        if step["name"] == "Require Apple Silicon build runner"
    )
    assert 'test "$(uname -m)" = "arm64"' in architecture["run"]
    assert not job.get("continue-on-error", False)
    for name in (
        "Require Apple Silicon build runner",
        "Build Tauri macOS package",
        "Require signed macOS updater assets for production",
        "Verify desktop (Tauri macOS)",
    ):
        step = next(step for step in steps if step.get("name") == name)
        assert not step.get("continue-on-error", False)
    build = (
        REPO_ROOT / "scripts/pack-tauri/build_macos_pyinstaller.sh"
    ).read_text(encoding="utf-8")
    deployment = build.index(
        'export MACOSX_DEPLOYMENT_TARGET="${MACOSX_DEPLOYMENT_TARGET:-14.0}"',
    )
    backend = build.index("bash scripts/pack-tauri/build_pyinstaller.sh")
    assert deployment < backend
    gate = "python scripts/pack-tauri/verify_macos_compatibility.py"
    staged = build.index(gate)
    signing = build.index('bash "${SIGN_MACOS_BUNDLE}"')
    assert (
        '--root "${REPO_ROOT}/console/src-tauri/binaries"'
        in build[staged:signing]
    )
    final = build.index(gate + ' --root "${APP_PATH}"')
    strict = build.index("codesign --verify --deep --strict --verbose=2")
    archive = build.index("# Create ZIP archive")
    assert backend < staged < signing < final < strict < archive
    assert build.count(gate) == 2
    assert "set -euo pipefail" in build[:deployment]
    assert "verify_frozen_plugins.py" in build[final:]
    assert "generate_update_manifest.py" in build[final:]


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


def test_unified_release_excludes_apps_and_uploads_every_selected_kind() -> (
    None
):
    import shlex
    import yaml

    expected = {"bundle", "tool", "memory", "channel", "hub"}
    for name in ("release-resume.yml", "plugins-build.yml"):
        jobs = yaml.safe_load(_workflow(name))["jobs"]
        pack = next(
            step["run"]
            for step in jobs["build-plugins"]["steps"]
            if "scripts/pack/generate_plugin_metadata.py"
            in step.get("run", "")
        )
        arguments = shlex.split(pack.replace("\\\n", " "))
        assert arguments[arguments.index("--exclude-kind") + 1] == "apps"
        assert "--only" not in arguments
        if name == "release-resume.yml":
            upload = next(
                step["run"]
                for step in jobs["publish-plugins"]["steps"]
                if "for kind in " in step.get("run", "")
            )
            selected = upload.split("for kind in ", 1)[1].split("; do", 1)[0]
            assert set(selected.split()) == expected


def test_release_install_scope_preserves_full_test_gate() -> None:
    import json
    import re
    import yaml

    release = yaml.safe_load(_workflow("release-resume.yml"))["jobs"]
    assert release["verify-web"]["with"]["verify_linux"] is False
    assert release["verify-web"]["with"]["verify_docker"] is False
    verification = yaml.safe_load(_workflow("release-verify.yml"))
    # PyYAML's YAML 1.1 parser treats the GitHub Actions `on` key as True.
    inputs = verification[True]["workflow_call"]["inputs"]
    assert inputs["verify_linux"]["default"] is True
    for job, matrix_key, expected_count in (
        ("verify-pip", "include", 4),
        ("verify-script-install", "os", 3),
    ):
        expression = verification["jobs"][job]["strategy"]["matrix"][
            matrix_key
        ]
        assert "fromJSON(inputs.verify_linux &&" in expression
        alternatives = re.findall(r"'([^']+)'", expression)
        assert len(alternatives) == 2
        all_platforms, desktop = map(json.loads, alternatives)
        assert len(all_platforms) == expected_count
        desktop_os = {
            row["os"] if isinstance(row, dict) else row for row in desktop
        }
        assert desktop_os == {"windows-latest", "macos-latest"}
        linux = [
            row
            for row in all_platforms
            if (row["os"] if isinstance(row, dict) else row) == "ubuntu-latest"
        ]
        assert len(linux) == expected_count - 2
        assert [row for row in all_platforms if row not in linux] == desktop
        assert not verification["jobs"][job].get("continue-on-error", False)
    nightly = _workflow("full-tests-nightly.yml")
    assert "ubuntu-latest" in nightly
    assert "python scripts/verify_update_regressions.py --check" in nightly
    assert "uses: ./.github/workflows/full-tests-nightly.yml" in _workflow(
        "release-resume.yml",
    )
